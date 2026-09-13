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

  const inputClass =
    "rounded-lg border border-border/40 bg-surface px-3.5 py-3 text-[15px] text-foreground focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15";
  const labelClass = "flex flex-col gap-1.5 text-[13px] font-semibold text-muted-foreground";

  return (
    <div className="mt-7">
      <div className="flex gap-5.5 border-b border-border/40 text-[14.5px] font-semibold">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`pb-2.5 -mb-px select-none ${tab === "login" ? "text-secondary border-b-2 border-primary" : "text-border"}`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setTab("register")}
          className={`pb-2.5 -mb-px select-none ${tab === "register" ? "text-secondary border-b-2 border-primary" : "text-border"}`}
        >
          Cadastrar
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
          <label className={labelClass}>
            E-mail
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            <span className="flex items-baseline justify-between">
              <span>Senha</span>
            </span>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
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
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-4">
          <label className={labelClass}>
            Nome completo
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </label>
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
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`${labelClass} min-w-0`}>
              WhatsApp (com DDD)
              <input
                type="tel"
                required
                placeholder="(66) 90000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${inputClass} min-w-0`}
              />
            </label>
            <label className={`${labelClass} min-w-0`}>
              Senha
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} min-w-0`}
              />
            </label>
          </div>
          <p className="-mt-2 text-[12.5px] text-border">Mínimo de 6 caracteres.</p>
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-lg bg-primary text-primary-foreground py-[15px] text-[15px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      )}

      {googleClientId && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="w-full flex items-center gap-3.5">
            <span className="flex-1 h-px bg-border/30" />
            <span className="text-[12.5px] text-border">ou</span>
            <span className="flex-1 h-px bg-border/30" />
          </div>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onReady={renderGoogleButton}
          />
          <div ref={googleButtonRef} />
          {googleError && <p className="text-red-600 text-xs">{googleError}</p>}
        </div>
      )}

      <p className="md:text-center mt-6 text-[13.5px] leading-relaxed text-muted-foreground">
        Ainda não tem acesso?{" "}
        <button type="button" onClick={() => setTab("register")} className="font-semibold text-secondary">
          Cadastre-se com seu CRM
        </button>{" "}
        — a verificação é automática e leva alguns segundos.
      </p>
    </div>
  );
}
