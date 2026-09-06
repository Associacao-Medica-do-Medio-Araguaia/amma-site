"use client";

import Link from "next/link";
import { useRef } from "react";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/institucional", label: "Institucional" },
  { href: "/galeria", label: "Galeria de Fotos" },
  { href: "/associado", label: "Espaço do Associado" },
  { href: "/reservar", label: "Reserva de Espaços" },
  { href: "/agenda", label: "Agenda" },
  { href: "/regras-de-uso", label: "Regras de Uso" },
  { href: "/localizacao", label: "Localização" },
  { href: "/contato", label: "Contato" },
];

export default function Nav({ memberName }: { memberName?: string }) {
  // <details>/<summary> abre e fecha nativamente no HTML, sem depender de JS/hidratação —
  // em conexões instáveis (ex. celular na rede do dev server) um onClick em React pode não
  // "pegar" a tempo; o navegador cuida do toggle sozinho aqui.
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  return (
    <nav className="relative bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 flex items-center">
        <details ref={detailsRef} className="min-w-0 xl:hidden">
          <summary className="flex items-center gap-2 py-3 text-sm font-medium tracking-wide uppercase cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true">☰</span> Menu
          </summary>
          <ul className="flex flex-col gap-3 pb-4 text-sm font-medium tracking-wide uppercase">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={closeMenu} className="block hover:opacity-80 transition-opacity">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>

        <ul className="hidden flex-nowrap items-center justify-center gap-x-3 py-3 text-sm font-medium uppercase overflow-x-auto xl:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="whitespace-nowrap">
              <Link href={link.href} className="hover:opacity-80 transition-opacity">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Posicionado fora do fluxo (absolute), ancorado por "top" fixo (não "top-1/2") — assim
          ele não se move quando o <details> mobile abre e aumenta a altura da nav abaixo dele. */}
      {memberName && (
        <Link
          href="/associado"
          className="absolute right-4 top-2 flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-primary-foreground/40 bg-primary-foreground/15 text-xs font-semibold"
          >
            {memberName.charAt(0).toUpperCase()}
          </span>
          <span className="hidden 2xl:inline">Olá, {memberName.split(" ")[0]}</span>
        </Link>
      )}
    </nav>
  );
}
