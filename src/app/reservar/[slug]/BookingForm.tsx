"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { formatCentsToBRL } from "@/lib/money";
import type { ShiftOption } from "@/lib/spaceRules";

interface BookingFormProps {
  spaceSlug: string;
  minDate: string; // "yyyy-mm-dd"
  shiftOptions: ShiftOption[];
  pricingUnit: "FLAT" | "HOURLY";
  priceCents: number;
  maxHoursPerBooking: number | null;
  operatingStartHour: number | null;
  operatingEndHour: number | null;
  paymentType: "SPLIT" | "FULL";
}

interface DayInfo {
  bookedRanges: [number, number][];
  latestEndHour: number | null;
}

export default function BookingForm({
  spaceSlug,
  minDate,
  shiftOptions,
  pricingUnit,
  priceCents,
  maxHoursPerBooking,
  operatingStartHour,
  operatingEndHour,
  paymentType,
}: BookingFormProps) {
  const router = useRouter();
  const isHourly = pricingUnit === "HOURLY";

  const [busyDates, setBusyDates] = useState<Set<string>>(new Set());
  const [date, setDate] = useState("");
  const [shiftLabel, setShiftLabel] = useState(shiftOptions[0]?.label ?? "");
  const [startHour, setStartHour] = useState(operatingStartHour ?? 8);
  const [hours, setHours] = useState(maxHoursPerBooking ?? 1);
  const [dayInfo, setDayInfo] = useState<DayInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/spaces/${spaceSlug}/busy-dates`)
      .then((res) => res.json())
      .then((data: { busyDates: string[] }) => setBusyDates(new Set(data.busyDates)))
      .catch(() => setError("Não foi possível carregar a disponibilidade. Tente recarregar a página."));
  }, [spaceSlug]);

  useEffect(() => {
    if (!isHourly || !date) {
      // Limpa info da data anterior ao trocar de data/turno; não dá pra computar isso no render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDayInfo(null);
      return;
    }
    fetch(`/api/spaces/${spaceSlug}/day-info?date=${date}`)
      .then((res) => res.json())
      .then((data: DayInfo) => setDayInfo(data))
      .catch(() => setDayInfo(null));
  }, [spaceSlug, date, isHourly]);

  const totalCents = isHourly ? priceCents * hours : priceCents;
  const depositCents = paymentType === "FULL" ? totalCents : Math.round(totalCents * 0.3);

  const openHour = operatingStartHour ?? 0;
  const closeHour = Math.min(operatingEndHour ?? 24, dayInfo?.latestEndHour ?? 24);
  const hourOptions = useMemo(() => {
    const options: number[] = [];
    for (let h = openHour; h + hours <= closeHour; h++) {
      const overlapsBooked = dayInfo?.bookedRanges.some(([s, e]) => h < e && h + hours > s) ?? false;
      if (!overlapsBooked) options.push(h);
    }
    return options;
  }, [openHour, closeHour, hours, dayInfo]);

  useEffect(() => {
    // Se o horário selecionado deixou de ser válido (ex. horário ocupado só é conhecido depois
    // de carregar o dia), o <select> muda o que é exibido na tela sem disparar onChange — o
    // navegador escolhe visualmente a primeira opção da lista, mas o estado React (o que de
    // fato é enviado no submit) fica parado no valor antigo. Sincroniza aqui para o valor
    // exibido ser sempre o valor enviado.
    if (isHourly && hourOptions.length > 0 && !hourOptions.includes(startHour)) {
      setStartHour(hourOptions[0]);
    }
  }, [isHourly, hourOptions, startHour]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Escolha uma data no calendário.");
      return;
    }
    if (busyDates.has(date)) {
      setError("Essa data já está ocupada. Escolha outra.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceSlug,
          date,
          ...(shiftOptions.length > 0 ? { shiftLabel } : {}),
          ...(isHourly ? { hours, startHour } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível concluir a reserva.");
        return;
      }
      router.push(`/reservar/confirmacao/${data.bookingId}`);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 max-w-md">
      <div>
        <p className="text-sm mb-2">Escolha a data</p>
        <AvailabilityCalendar
          minDate={minDate}
          busyDates={busyDates}
          selectedDate={date}
          onSelect={(d) => {
            setError(null);
            setDate(d);
          }}
        />
      </div>

      {shiftOptions.length > 0 && (
        <fieldset className="flex flex-col gap-1 text-sm">
          <legend className="mb-1">Turno</legend>
          {shiftOptions.map((option) => (
            <label key={option.label} className="flex items-center gap-2">
              <input
                type="radio"
                name="shift"
                value={option.label}
                checked={shiftLabel === option.label}
                onChange={() => {
                  setError(null);
                  setShiftLabel(option.label);
                }}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      )}

      {isHourly && (
        <div className="flex flex-col gap-3 text-sm">
          {dayInfo && dayInfo.bookedRanges.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Horários já reservados nesse dia:{" "}
              {dayInfo.bookedRanges.map(([s, e]) => `${s}h-${e}h`).join(", ")}
            </p>
          )}
          {dayInfo?.latestEndHour != null && (
            <p className="text-xs text-muted-foreground">
              Já há um evento reservado nesse dia — a quadra só pode ser usada até{" "}
              {dayInfo.latestEndHour}h.
            </p>
          )}
          <label className="flex flex-col gap-1">
            Duração
            <select
              value={hours}
              onChange={(e) => {
                setError(null);
                setHours(Number(e.target.value));
              }}
              className="rounded-md border border-border bg-surface px-3 py-2"
            >
              {Array.from({ length: maxHoursPerBooking ?? 1 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>
                  {h}h
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Horário de início
            <select
              value={startHour}
              onChange={(e) => {
                setError(null);
                setStartHour(Number(e.target.value));
              }}
              className="rounded-md border border-border bg-surface px-3 py-2"
            >
              {hourOptions.length === 0 && <option value={startHour}>Sem horário disponível</option>}
              {hourOptions.map((h) => (
                <option key={h} value={h}>
                  {h}h às {h + hours}h
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <p className="text-sm">
        {paymentType === "FULL" ? "Valor a pagar" : "Sinal a pagar agora"}:{" "}
        <span className="font-medium">{formatCentsToBRL(depositCents)}</span>
        {isHourly && (
          <span className="text-muted-foreground"> ({formatCentsToBRL(totalCents)} total)</span>
        )}
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Enviando..." : "Continuar para pagamento"}
      </button>
    </form>
  );
}
