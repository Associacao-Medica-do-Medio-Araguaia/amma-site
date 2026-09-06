"use client";

import { useState } from "react";

export default function CopyPixButton({ code }: { code: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-4 flex flex-col items-center">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90"
      >
        {status === "copied" ? "Copiado!" : "📋 Copiar código Pix"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Não foi possível copiar automaticamente — selecione o texto abaixo e copie manualmente.
        </p>
      )}
    </div>
  );
}
