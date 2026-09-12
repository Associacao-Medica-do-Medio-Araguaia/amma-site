"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { BRAZIL_UF_CODES } from "@/lib/crm";

interface GoogleCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { type: string; shape: string; theme: string; text: string; size: string },
          ) => void;
        };
      };
    };
  }
}

export default function AssociadoAuthForms({ googleClientId }: { googleClientId?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  async function handleGoogleCredential(response: GoogleCredentialResponse) {
    setGoogleError(null);
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential }),
    });
    if (!res.ok) {
      setGoogleError("Não foi possível entrar com o Google.");
      return;
    }
    router.refresh();
  }

  // O GSI só escaneia o HTML em busca de botões uma vez, quando o script termina de carregar.
  // Navegar entre páginas do site (client-side) desmonta e remonta essa div, então precisamos
  // renderizar o botão manualmente a cada montagem — por isso usamos o onReady do next/script
  // como único gatilho: ele roda toda vez que o componente monta (script já carregado ou não),
  // diferente do onLoad, que dispara uma única vez para o script inteiro.
  function renderGoogleButton() {
    if (!googleClientId || !googleButtonRef.current || !window.google) return;
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: handleGoogleCredential });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard",
      shape: "pill",
      theme: "outline",
      text: "signin_with",
      size: "large",
    });
  }

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [crm, setCrm] = useState("");
  const [crmUf, setCrmUf] = useState("");
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
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
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
        body: JSON.stringify({ name, email, crm, crmUf, phone, password }),
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
          className={`pb-2 select-none ${tab === "login" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`pb-2 select-none ${tab === "register" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          Cadastrar
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="mt-4 flex flex-col gap-3 text-sm">
          <label className="flex flex-col gap-1">
            E-mail
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
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

      {googleClientId && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">ou</p>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onReady={renderGoogleButton}
          />
          <div ref={googleButtonRef} />
          {googleError && <p className="text-red-600 text-xs">{googleError}</p>}
        </div>
      )}
    </div>
  );
}
