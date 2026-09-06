import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { getCurrentMember } from "@/lib/memberAuth";

export default async function Header() {
  const member = await getCurrentMember();

  return (
    <header className="bg-surface">
      <div className="flex items-center justify-center py-4 px-4">
        <Link href="/">
          <Image src="/logo.png" alt="AMMA" width={681} height={696} className="h-28 w-auto" priority />
        </Link>
      </div>
      <Nav memberName={member?.name} />
    </header>
  );
}
