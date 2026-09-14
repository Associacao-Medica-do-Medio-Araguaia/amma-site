"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/institucional", label: "Institucional" },
  { href: "/reservar", label: "Reservas" },
  { href: "/agenda", label: "Agenda" },
  { href: "/regras-de-uso", label: "Regras de uso" },
  { href: "/galeria", label: "Galeria" },
  { href: "/contato", label: "Contato" },
];

function isActiveLink(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Nav({ memberName }: { memberName?: string }) {
  const pathname = usePathname();
  // <details>/<summary> abre e fecha nativamente no HTML, sem depender de JS/hidratação —
  // em conexões instáveis (ex. celular na rede do dev server) um onClick em React pode não
  // "pegar" a tempo; o navegador cuida do toggle sozinho aqui.
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  function closeMenu() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  // Mede a posição do link ativo pra deslizar o sublinhado até ele — precisa recalcular a
  // cada troca de rota e quando a janela redimensiona (os links quebram linha em telas menores).
  useEffect(() => {
    function measure() {
      const activeIndex = NAV_LINKS.findIndex((link) => isActiveLink(pathname, link.href));
      const activeEl = linkRefs.current[activeIndex];
      const listEl = listRef.current;
      if (!activeEl || !listEl) {
        setIndicator(null);
        return;
      }
      const listRect = listEl.getBoundingClientRect();
      const linkRect = activeEl.getBoundingClientRect();
      setIndicator({ left: linkRect.left - listRect.left, width: linkRect.width });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  const accountLink = memberName ? (
    <Link href="/associado" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-secondary text-sm font-bold"
      >
        {memberName.charAt(0).toUpperCase()}
      </span>
      <span className="hidden 2xl:inline text-sm text-muted-foreground">Olá, {memberName.split(" ")[0]}</span>
    </Link>
  ) : (
    <Link
      href="/associado"
      className="rounded-full bg-accent-soft text-secondary px-4 py-2 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap"
    >
      <span className="hidden sm:inline">Espaço do Associado</span>
      <span className="sm:hidden">Entrar</span>
    </Link>
  );

  return (
    <div className="flex flex-1 items-center min-w-0">
      <ul
        ref={listRef}
        className="relative hidden xl:flex flex-wrap items-center gap-x-6 gap-y-1 text-[13.5px] font-semibold text-muted-foreground"
      >
        {NAV_LINKS.map((link, index) => {
          const active = isActiveLink(pathname, link.href);
          return (
            <li key={link.href} className="whitespace-nowrap">
              <Link
                ref={(el) => {
                  linkRefs.current[index] = el;
                }}
                href={link.href}
                className={`block border-b-2 border-transparent pb-[3px] transition-colors ${
                  active ? "text-secondary" : "hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
        <span
          aria-hidden="true"
          className="absolute bottom-0 h-[2px] rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ left: indicator?.left ?? 0, width: indicator?.width ?? 0, opacity: indicator ? 1 : 0 }}
        />
      </ul>

      <div className="ml-auto flex items-center gap-3">
        {accountLink}

        {/* Posicionado fora do fluxo (absolute), ancorado à direita do cabeçalho, pra não
            empurrar o layout quando o painel abre. */}
        <details ref={detailsRef} className="relative xl:hidden">
          <summary className="flex h-9 w-9 items-center justify-center text-secondary cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" className="h-5 w-5" />
          </summary>
          <ul className="absolute right-0 top-full w-56 rounded-lg border border-border/60 bg-surface py-2 shadow-lg text-sm font-semibold text-muted-foreground z-20">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className={`block px-4 py-2 hover:text-primary transition-colors ${
                    isActiveLink(pathname, link.href) ? "text-secondary" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t border-border/60 pt-2">
              <Link href="/associado" onClick={closeMenu} className="block px-4 py-2 hover:text-primary transition-colors">
                {memberName ? `Olá, ${memberName.split(" ")[0]}` : "Espaço do Associado"}
              </Link>
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
}
