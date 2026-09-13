import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { getCurrentMember } from "@/lib/memberAuth";

export default async function Header() {
  const member = await getCurrentMember();

  return (
    <header className="bg-surface border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 flex items-center gap-6 py-2.5">
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="AMMA" width={681} height={696} className="h-14 w-auto xl:h-[68px]" priority />
        </Link>
        <Nav memberName={member?.name} />
      </div>
    </header>
  );
}
