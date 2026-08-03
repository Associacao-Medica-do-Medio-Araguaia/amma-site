"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteProfileForm({
  initialCpf,
  initialPhone,
}: {
  initialCpf: string | null;
  initialPhone: string | null;
}) {
  const router = useRouter();
  const [cpf, setCpf] = useState(initialCpf ?? "");
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
        body: JSON.stringify({ cpf, phone }),
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
      <label className="flex flex-col gap-1">
        CPF
        <input
          type="text"
          required
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2"
        />
      </label>
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
