import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ReservarPage() {
  const spaces = await prisma.space.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex-1 mx-auto max-w-3xl px-6 py-12 w-full">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Escolha o espaço</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cada espaço tem sua própria antecedência mínima de reserva.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {spaces.map((space) => (
          <Link
            key={space.id}
            href={`/reservar/${space.slug}`}
            className="rounded-lg border border-border bg-surface p-4 flex items-center justify-between hover:border-primary transition-colors"
          >
            <div>
              <p className="font-medium">{space.name}</p>
              <p className="text-sm text-muted-foreground">{space.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Antecedência mínima: {space.minAdvanceDays} dias
              </p>
            </div>
            <p className="text-sm font-medium whitespace-nowrap ml-4">
              {formatCentsToBRL(space.priceCents)}
              {space.pricingUnit === "HOURLY" && "/h"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
