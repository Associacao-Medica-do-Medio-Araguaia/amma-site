"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BRAZIL_UF_CODES } from "@/lib/crm";

export default function CompleteProfileForm({
  initialCrm,
  initialCrmUf,
  initialPhone,
}: {
  initialCrm: string | null;
  initialCrmUf: string | null;
  initialPhone: string | null;
}) {
  const router = useRouter();
  const [crm, setCrm] = useState(initialCrm ?? "");
  const [crmUf, setCrmUf] = useState(initialCrmUf ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/associado/completar-cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crm, crmUf, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "rounded-lg border border-border/40 bg-surface px-3.5 py-3 text-[15px] text-foreground focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15";
  const labelClass = "flex flex-col gap-1.5 text-[13px] font-semibold text-muted-foreground";

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-sm flex flex-col gap-4">
      <div className="grid grid-cols-[1fr_104px] gap-3">
        <label className={`${labelClass} min-w-0`}>
          CRM
          <input
            type="text"
            required
            placeholder="12345"
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
            className={`${inputClass} min-w-0`}
          />
        </label>
        <label className={`${labelClass} min-w-0`}>
          UF
          <select required value={crmUf} onChange={(e) => setCrmUf(e.target.value)} className={`${inputClass} min-w-0`}>
            <option value="" disabled>
              --
            </option>
            {BRAZIL_UF_CODES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className={labelClass}>
        WhatsApp (com DDD)
        <input
          type="tel"
          required
          placeholder="(66) 90000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
      </label>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-lg bg-primary text-primary-foreground py-[15px] text-[15px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Salvando..." : "Concluir cadastro"}
      </button>
    </form>
  );
}
