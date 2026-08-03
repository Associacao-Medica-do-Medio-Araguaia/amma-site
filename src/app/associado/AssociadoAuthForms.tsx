"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssociadoAuthForms({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [loginCpf, setLoginCpf] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/associado/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: loginCpf, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível entrar.");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/associado/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, cpf, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível cadastrar.");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 max-w-sm">
      <div className="flex gap-4 border-b border-border text-sm font-medium">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`pb-2 ${tab === "login" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`pb-2 ${tab === "register" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          Cadastrar
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="mt-4 flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1">
            CPF
            <input
              type="text"
              required
              placeholder="000.000.000-00"
              value={loginCpf}
              onChange={(e) => setLoginCpf(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            Senha
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2"
            />
          </label>
          {error && <p className="text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="mt-4 flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1">
            Nome completo
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2"
            />
          </label>
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
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <label className="flex flex-col gap-1">
            Senha
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2"
            />
          </label>
          {error && <p className="text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      )}

      {googleEnabled && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">ou</p>
          <a
            href="/api/auth/google"
            className="w-full text-center rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-surface-muted transition-colors"
          >
            Entrar com Google
          </a>
        </div>
      )}
    </div>
  );
}
