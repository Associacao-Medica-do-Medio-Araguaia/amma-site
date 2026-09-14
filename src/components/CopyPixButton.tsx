"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyPixButton({ code }: { code: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard API indisponível");
      await navigator.clipboard.writeText(code);
      setStatus("copied");
      return;
    } catch {
      // Fallback pra navegadores/contextos onde a Clipboard API falha (permissão negada,
      // contexto não seguro, embed em iframe restrito) — execCommand é mais antigo, mas
      // funciona nesses casos porque não depende da Permissions API.
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      setStatus(copied ? "copied" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-4 flex flex-col items-center">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        {status === "copied" ? (
          <>
            <Check className="h-4 w-4" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copiar código Pix
          </>
        )}
      </button>
      {status === "error" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Não foi possível copiar automaticamente — selecione o texto abaixo e copie manualmente.
        </p>
      )}
    </div>
  );
}
