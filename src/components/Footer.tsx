"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith("/admin");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground space-y-2">
      <p>AMMA {year}. Direitos reservados.</p>
      {isAdminArea ? (
        <Link href="/" className="block hover:underline">
          Voltar para a página principal
        </Link>
      ) : (
        <Link href="/admin" className="block hover:underline">
          Painel administrativo
        </Link>
      )}
    </footer>
  );
}
