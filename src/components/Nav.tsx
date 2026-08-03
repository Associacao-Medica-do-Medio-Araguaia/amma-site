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

export default function Nav() {
  // <details>/<summary> abre e fecha nativamente no HTML, sem depender de JS/hidratação —
  // em conexões instáveis (ex. celular na rede do dev server) um onClick em React pode não
  // "pegar" a tempo; o navegador cuida do toggle sozinho aqui.
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function closeMenu() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4">
        <details ref={detailsRef} className="xl:hidden">
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

        <ul className="hidden xl:flex flex-nowrap items-center justify-between gap-x-3 py-3 text-sm font-medium uppercase overflow-x-auto">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="whitespace-nowrap">
              <Link href={link.href} className="hover:opacity-80 transition-opacity">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
