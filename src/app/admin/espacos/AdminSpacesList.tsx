"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { formatCentsToBRL } from "@/lib/money";

export interface AdminSpaceRow {
  id: string;
  name: string;
  description: string;
  pricingUnit: "FLAT" | "HOURLY";
  priceCents: number;
  capacity: number | null;
  minAdvanceDays: number;
  monthlyLimitPerMember: number | null;
  yearlyLimitPerMember: number | null;
  maxHoursPerBooking: number | null;
}

interface FormState {
  description: string;
  priceReais: string;
  capacity: string;
  minAdvanceDays: string;
  monthlyLimitPerMember: string;
  yearlyLimitPerMember: string;
  maxHoursPerBooking: string;
}

function toFormState(space: AdminSpaceRow): FormState {
  return {
    description: space.description,
    priceReais: (space.priceCents / 100).toFixed(2).replace(".", ","),
    capacity: space.capacity != null ? String(space.capacity) : "",
    minAdvanceDays: String(space.minAdvanceDays),
    monthlyLimitPerMember: space.monthlyLimitPerMember != null ? String(space.monthlyLimitPerMember) : "",
    yearlyLimitPerMember: space.yearlyLimitPerMember != null ? String(space.yearlyLimitPerMember) : "",
    maxHoursPerBooking: space.maxHoursPerBooking != null ? String(space.maxHoursPerBooking) : "",
  };
}

// Aceita "150,00" ou "150.00"; retorna null se não for um valor válido.
function parseReaisToCents(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;
  const reais = Number(normalized);
  if (!Number.isFinite(reais) || reais <= 0) return null;
  return Math.round(reais * 100);
}

function parseOptionalInt(value: string): number | null | undefined {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "rounded-md border border-border bg-surface px-3 py-2 text-sm";

function SpaceEditForm({
  space,
  onCancel,
  onSaved,
}: {
  space: AdminSpaceRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(space));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceCents = parseReaisToCents(form.priceReais);
    if (priceCents == null) {
      setError("Informe um preço válido (ex.: 150,00).");
      return;
    }
    if (form.description.trim().length === 0) {
      setError("A descrição não pode ficar em branco.");
      return;
    }
    const minAdvanceDays = Number(form.minAdvanceDays);
    if (!Number.isInteger(minAdvanceDays) || minAdvanceDays < 0) {
      setError("Antecedência mínima inválida.");
      return;
    }
    const capacity = parseOptionalInt(form.capacity);
    const monthlyLimitPerMember = parseOptionalInt(form.monthlyLimitPerMember);
    const yearlyLimitPerMember = parseOptionalInt(form.yearlyLimitPerMember);
    const maxHoursPerBooking = parseOptionalInt(form.maxHoursPerBooking);
    if (
      capacity === undefined ||
      monthlyLimitPerMember === undefined ||
      yearlyLimitPerMember === undefined ||
      maxHoursPerBooking === undefined
    ) {
      setError("Verifique os campos numéricos — deixe em branco para 'sem limite' ou informe um número maior que zero.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/spaces/${space.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description.trim(),
          priceCents,
          capacity,
          minAdvanceDays,
          monthlyLimitPerMember,
          yearlyLimitPerMember,
          maxHoursPerBooking,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao salvar as alterações.");
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 border-t border-border/50 pt-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Field label="Descrição">
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Field label={space.pricingUnit === "HOURLY" ? "Valor por hora (R$)" : "Valor total (R$)"}>
          <input value={form.priceReais} onChange={(e) => update("priceReais", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Antecedência mínima (dias)">
          <input
            type="number"
            min={0}
            value={form.minAdvanceDays}
            onChange={(e) => update("minAdvanceDays", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Capacidade (convidados)">
          <input
            type="number"
            min={1}
            placeholder="sem limite"
            value={form.capacity}
            onChange={(e) => update("capacity", e.target.value)}
            className={inputClass}
          />
        </Field>
        {space.pricingUnit === "HOURLY" && (
          <Field label="Máx. de horas por reserva">
            <input
              type="number"
              min={1}
              placeholder="sem limite"
              value={form.maxHoursPerBooking}
              onChange={(e) => update("maxHoursPerBooking", e.target.value)}
              className={inputClass}
            />
          </Field>
        )}
        <Field label="Limite mensal por associado">
          <input
            type="number"
            min={1}
            placeholder="sem limite"
            value={form.monthlyLimitPerMember}
            onChange={(e) => update("monthlyLimitPerMember", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Limite anual por associado">
          <input
            type="number"
            min={1}
            placeholder="sem limite"
            value={form.yearlyLimitPerMember}
            onChange={(e) => update("yearlyLimitPerMember", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function AdminSpacesList({ spaces }: { spaces: AdminSpaceRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {spaces.map((space) => {
        const isEditing = editingId === space.id;
        return (
          <div key={space.id} className="rounded-lg border border-border p-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-semibold text-foreground">{space.name}</h2>
                <p className="mt-1 text-muted-foreground">{space.description}</p>
                <p className="mt-2 text-xs text-border">
                  {formatCentsToBRL(space.priceCents)}
                  {space.pricingUnit === "HOURLY" ? "/hora" : " (total)"}
                  {space.capacity != null && ` · capacidade ${space.capacity}`}
                  {` · antecedência mínima ${space.minAdvanceDays} dias`}
                </p>
              </div>
              <button
                onClick={() => setEditingId(isEditing ? null : space.id)}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent-soft transition-colors"
              >
                {isEditing ? (
                  <>
                    <X className="h-3.5 w-3.5" />
                    Fechar
                  </>
                ) : (
                  <>
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </>
                )}
              </button>
            </div>

            {isEditing && (
              <SpaceEditForm
                space={space}
                onCancel={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null);
                  router.refresh();
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
