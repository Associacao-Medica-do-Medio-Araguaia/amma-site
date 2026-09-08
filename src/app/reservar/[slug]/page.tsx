import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { earliestBookableDate, toDateOnlyString } from "@/lib/dates";
import { parseShiftOptions } from "@/lib/spaceRules";
import { getCurrentMember } from "@/lib/memberAuth";
import BookingForm from "./BookingForm";

export default async function SpaceBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) notFound();

  const member = await getCurrentMember();
  const canBook = Boolean(member?.crm && member.phone);

  const shiftOptions = parseShiftOptions(space.shiftOptions);
  const isHourly = space.pricingUnit === "HOURLY";

  return (
    <div className="flex-1 mx-auto max-w-3xl px-6 py-12 w-full">
      <Link href="/reservar" className="text-sm text-muted-foreground hover:underline">
        ← Escolher outro espaço
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">{space.name}</h1>
      <p className="mt-2 rounded-lg bg-amber-100 text-amber-900 text-sm px-4 py-2 inline-block">
        Reserva exclusiva para médicos associados à AMMA.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{space.description}</p>

      <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-sm space-y-1">
        {space.capacity != null && <p>Capacidade máxima: {space.capacity} convidados</p>}
        <p>Antecedência mínima para reservar: {space.minAdvanceDays} dias</p>
        {isHourly ? (
          <>
            <p>
              Valor: <span className="font-medium">{formatCentsToBRL(space.priceCents)}</span>{" "}
              por hora (máx. {space.maxHoursPerBooking}h por associado)
            </p>
            <p>
              Pagamento único, até {space.finalDueDays} dias antes da data de uso.
            </p>
          </>
        ) : (
          <>
            {shiftOptions.length > 0 && (
              <p>Turnos disponíveis: {shiftOptions.map((s) => s.label).join(" ou ")}</p>
            )}
            <p>
              Valor total: <span className="font-medium">{formatCentsToBRL(space.priceCents)}</span>
            </p>
            <p>
              Sinal a pagar agora (30%):{" "}
              <span className="font-medium">
                {formatCentsToBRL(Math.round(space.priceCents * 0.3))}
              </span>
            </p>
            <p>
              Restante (pago até {space.finalDueDays} dias antes da data):{" "}
              <span className="font-medium">
                {formatCentsToBRL(space.priceCents - Math.round(space.priceCents * 0.3))}
              </span>
            </p>
          </>
        )}
        {space.monthlyLimitPerMember != null && (
          <p className="text-muted-foreground">
            Limite por associado: {space.monthlyLimitPerMember}x por mês, até{" "}
            {space.yearlyLimitPerMember}x por ano, neste espaço.
          </p>
        )}
      </div>

      {canBook ? (
        <BookingForm
          spaceSlug={space.slug}
          minDate={toDateOnlyString(earliestBookableDate(space.minAdvanceDays))}
          shiftOptions={shiftOptions}
          pricingUnit={space.pricingUnit}
          priceCents={space.priceCents}
          maxHoursPerBooking={space.maxHoursPerBooking}
          operatingStartHour={space.operatingStartHour}
          operatingEndHour={space.operatingEndHour}
          paymentType={space.paymentType}
        />
      ) : (
        <div className="mt-8 rounded-lg border border-border bg-surface p-6 text-sm">
          <p className="font-medium">Você precisa estar logado para reservar.</p>
          <p className="mt-2 text-muted-foreground">
            {member
              ? "Falta completar seu cadastro (CRM e telefone) para reservar."
              : "Entre ou cadastre-se como associado para continuar."}
          </p>
          <Link
            href="/associado"
            className="mt-4 inline-block rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {member ? "Completar cadastro" : "Entrar / Cadastrar"}
          </Link>
        </div>
      )}
    </div>
  );
}
