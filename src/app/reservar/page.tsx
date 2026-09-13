import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { parseShiftOptions } from "@/lib/spaceRules";

export const dynamic = "force-dynamic";

const SPACE_PHOTO: Record<string, string> = {
  "salao-de-festa": "/fotos/salao-eventos.jpg",
  "area-externa": "/fotos/piscina.jpg",
  "cozinha-gourmet": "/fotos/cozinha.jpg",
  "quadra-de-areia": "/fotos/patio-piscina.jpg",
};

export default async function ReservarPage() {
  const spaces = await prisma.space.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex-1">
      <div className="bg-linear-to-b from-accent-soft to-background">
        <div className="mx-auto max-w-7xl px-6 py-11 md:py-[46px]">
          <p className="text-[11.5px] font-semibold uppercase tracking-[.2em] text-secondary">Reservas</p>
          <h1 className="mt-3.5 text-[32px] md:text-[44px] leading-[1.1] md:leading-[1.08] font-serif font-semibold tracking-[-.02em] text-foreground">
            Escolha o espaço
          </h1>
          <div className="mt-4.5 flex items-center gap-4 flex-wrap">
            <span className="rounded-full bg-foreground text-background text-[13px] font-semibold px-4 py-2">
              Exclusivo para médicos associados
            </span>
            <p className="text-[15.5px] text-muted-foreground">
              Cada espaço tem sua própria antecedência mínima de reserva.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-11 md:py-[52px] flex flex-col gap-4">
        {spaces.map((space) => {
          const shiftOptions = parseShiftOptions(space.shiftOptions);
          const isHourly = space.pricingUnit === "HOURLY";
          const details = isHourly
            ? `Até ${space.maxHoursPerBooking}h por associado · antecedência mínima de ${space.minAdvanceDays} dias · pagamento único`
            : [
                shiftOptions.length > 0 ? `Turnos: ${shiftOptions.map((s) => s.label).join(" ou ")}` : null,
                `antecedência mínima de ${space.minAdvanceDays} dias`,
                "sinal de 30% no ato",
              ]
                .filter(Boolean)
                .join(" · ");

          return (
            <div
              key={space.id}
              className="rounded-[18px] border border-border/40 bg-surface p-5 flex flex-col md:flex-row gap-5 md:items-center"
            >
              <div className="relative shrink-0 w-full h-40 md:w-[168px] md:h-[122px] rounded-xl overflow-hidden">
                <Image src={SPACE_PHOTO[space.slug] ?? "/fotos/fachada.jpg"} alt="" fill sizes="168px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-[21px] md:text-[23px] font-semibold text-foreground">{space.name}</h2>
                  {space.capacity != null && (
                    <span className="rounded-full bg-accent-soft text-secondary text-[11.5px] font-bold px-2.5 py-1">
                      {space.capacity} pessoas
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[15px] leading-snug text-muted-foreground">{space.description}</p>
                <p className="mt-2.5 text-[13.5px] text-border">{details}</p>
              </div>
              <div className="text-left md:text-right shrink-0">
                <p className="text-[22px] md:text-2xl font-bold text-secondary">
                  {formatCentsToBRL(space.priceCents)}
                  {isHourly && <span className="text-base font-normal text-border">/hora</span>}
                </p>
                <Link
                  href={`/reservar/${space.slug}`}
                  className="mt-3 inline-block rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Ver datas
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
