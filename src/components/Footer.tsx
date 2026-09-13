"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { whatsapp as whatsappConfig } from "@/lib/config";
import { location } from "@/lib/location";

export default function Footer() {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith("/admin");
  const year = new Date().getFullYear();
  const whatsappDigits = whatsappConfig.displayNumber.replace(/\D/g, "");

  return (
    <footer className="bg-foreground text-accent-soft">
      <div className="mx-auto max-w-7xl px-6 py-9 flex flex-wrap items-center gap-x-9 gap-y-5">
        <div className="flex-1 min-w-[240px]">
          <h2 className="text-lg font-semibold text-white sm:text-2xl">
            <span className="sm:hidden">Precisa de ajuda?</span>
            <span className="hidden sm:inline">Fale com a secretaria</span>
          </h2>
          <p className="mt-2 text-sm text-accent-soft/80">{location.addressLines.join(" — ")}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg text-surface-muted sm:text-[19px]">{whatsappConfig.displayNumber}</span>
          <a
            href={`https://wa.me/${whatsappDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-3.5 text-center text-[11.5px] text-accent-soft/55 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
        <span>© AMMA {year}. Direitos reservados.</span>
        {isAdminArea ? (
          <Link href="/" className="hover:underline">
            Voltar para a página principal
          </Link>
        ) : (
          <Link href="/admin" className="hover:underline">
            Painel administrativo
          </Link>
        )}
      </div>
    </footer>
  );
}
