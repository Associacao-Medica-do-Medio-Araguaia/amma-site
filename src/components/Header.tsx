import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { getCurrentMember } from "@/lib/memberAuth";

export default async function Header() {
  const member = await getCurrentMember();

  return (
    <header className="bg-surface">
      <div className="grid grid-cols-3 items-center py-4 px-4">
        <div />
        <Link href="/" className="justify-self-center">
          <Image src="/logo.png" alt="AMMA" width={681} height={696} className="h-28 w-auto" priority />
        </Link>
        <div className="justify-self-end">
          {member && (
            <Link href="/associado" className="flex items-center gap-2 text-sm">
              <span className="hidden sm:inline text-muted-foreground">Bem-vindo, {member.name}</span>
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium"
              >
                {member.name.charAt(0).toUpperCase()}
              </span>
            </Link>
          )}
        </div>
      </div>
      <Nav />
    </header>
  );
}
