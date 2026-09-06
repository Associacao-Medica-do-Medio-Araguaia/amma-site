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

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-sm flex flex-col gap-3 text-sm">
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1">
          CRM
          <input
            type="text"
            required
            placeholder="12345"
            value={crm}
            onChange={(e) => setCrm(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2"
          />
        </label>
        <label className="flex w-24 flex-col gap-1">
          UF
          <select
            required
            value={crmUf}
            onChange={(e) => setCrmUf(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2"
          >
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
      <label className="flex flex-col gap-1">
        WhatsApp (com DDD)
        <input
          type="tel"
          required
          placeholder="(66) 90000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2"
        />
      </label>
      {error && <p className="text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Salvando..." : "Concluir cadastro"}
      </button>
    </form>
  );
}
