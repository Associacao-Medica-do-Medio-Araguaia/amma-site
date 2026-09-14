import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Fotos de destaque por espaço — os placeholders em Space.photos ainda não foram substituídos
// pelas fotos reais da sede, então usamos as mesmas fotos já publicadas em /public/fotos (como
// a Galeria e a home antiga já faziam).
const SPACE_PHOTO: Record<string, string> = {
  "salao-de-festa": "/fotos/salao-eventos.jpg",
  "area-externa": "/fotos/piscina.jpg",
  "cozinha-gourmet": "/fotos/cozinha.jpg",
  "quadra-de-areia": "/fotos/patio-piscina.jpg",
};

function spaceBadge(space: { capacity: number | null; operatingStartHour: number | null; operatingEndHour: number | null }) {
  if (space.capacity != null) return `${space.capacity} pessoas`;
  if (space.operatingStartHour != null && space.operatingEndHour != null) {
    return `${space.operatingStartHour}h às ${space.operatingEndHour}h`;
  }
  return null;
}

export default async function HomePage() {
  const spaces = await prisma.space.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex-1">
      <div className="relative overflow-hidden bg-linear-to-b from-accent-soft to-background">
        {/* Desktop: foto grudada na borda direita da tela (fora do container com padding),
            ocupando a altura toda do hero, com fade na lateral esquerda. */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-[48%]">
          <Image
            src="/fotos/fachada.jpg"
            alt="Fachada da sede"
            fill
            sizes="48vw"
            className="object-cover object-[center_62%] [mask-image:linear-gradient(to_right,transparent,black_40%)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_40%)]"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24 grid md:grid-cols-[1.05fr_.95fr] gap-10 md:gap-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-secondary">
              Sede AMMA · desde 1981
            </p>
            <h1 className="mt-3.5 text-[33px] leading-[1.1] md:text-[47px] md:leading-[1.08] font-serif font-semibold tracking-[-.02em] text-foreground">
              A sede onde os médicos do Araguaia se encontram.
            </h1>
            <p className="mt-3.5 md:mt-4.5 max-w-[440px] text-[15px] md:text-[16.5px] leading-relaxed text-muted-foreground">
              Piscina, redário, salão de eventos e cozinha gourmet — espaços de uso exclusivo dos
              associados e de suas famílias.
            </p>
            <div className="mt-[22px] md:mt-7 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <Link
                href="/institucional"
                className="rounded-lg bg-primary text-primary-foreground px-[26px] py-[13px] text-[14.5px] font-semibold text-center hover:opacity-90 transition-opacity"
              >
                Conheça a sede
              </Link>
              <Link
                href="/associado"
                className="rounded-lg border border-surface-muted text-secondary px-[26px] py-[13px] text-[14.5px] font-semibold text-center hover:bg-primary/5 transition-colors"
              >
                Espaço do Associado
              </Link>
            </div>
          </div>

          {/* Mobile: a foto vai até a borda da tela (sem padding/cantos), com fade em cima
              dissolvendo pro fundo, do lado do texto. */}
          <div className="relative -mx-6 mt-2 h-[240px] md:hidden">
            <Image
              src="/fotos/fachada.jpg"
              alt="Fachada da sede"
              fill
              sizes="100vw"
              className="object-cover object-[center_62%] [mask-image:linear-gradient(to_bottom,transparent,black_40%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_40%)]"
            />
          </div>

          {/* Espaçador: reserva a largura da coluna direita do grid pro texto não esticar por
              cima da foto, que é renderizada fora daqui (posicionada de forma absoluta acima). */}
          <div aria-hidden="true" className="hidden md:block" />
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-2xl md:text-[30px] font-semibold text-foreground">Os espaços da sede</h2>
          <Link
            href="/galeria"
            className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">Ver galeria completa</span>
            <span className="sm:hidden">Ver galeria</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-3 md:gap-[18px]">
          {spaces.map((space) => {
            const badge = spaceBadge(space);
            return (
              <Link
                key={space.id}
                href={`/reservar/${space.slug}`}
                className="rounded-2xl border border-border/40 bg-surface p-3.5 md:p-[18px] flex items-center gap-3.5 md:gap-[18px] hover:border-primary transition-colors"
              >
                <div className="relative shrink-0 w-[84px] h-[76px] md:w-[120px] md:h-24 rounded-[10px] overflow-hidden">
                  <Image src={SPACE_PHOTO[space.slug] ?? "/fotos/fachada.jpg"} alt="" fill sizes="120px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[16.5px] md:text-[19px] font-semibold text-foreground">{space.name}</h3>
                    {badge && (
                      <span className="rounded-full bg-accent-soft text-secondary text-[10.5px] md:text-[11px] font-bold px-2.5 py-1">
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13px] md:text-[13.5px] leading-snug text-muted-foreground">
                    {space.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
