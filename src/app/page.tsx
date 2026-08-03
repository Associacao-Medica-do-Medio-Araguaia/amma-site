import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { whatsapp as whatsappConfig } from "@/lib/config";
import { location } from "@/lib/location";

export const dynamic = "force-dynamic";

// TODO(cliente): trocar o espaço em destaque se quiser outro além da Quadra de Areia.
const FEATURED_SPACE_SLUG = "quadra-de-areia";

export default async function HomePage() {
  const featuredSpace = await prisma.space.findUnique({ where: { slug: FEATURED_SPACE_SLUG } });
  const whatsappDigits = whatsappConfig.displayNumber.replace(/\D/g, "");

  return (
    <div className="flex-1">
      <header className="bg-foreground text-background">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Reserve nossos espaços
          </h1>
          <p className="mt-4 text-base sm:text-lg opacity-80">
            Conheça nossos espaços e reserve para seus eventos e confraternizações.
          </p>
          <Link
            href="/reservar"
            className="mt-8 inline-block rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Fazer uma reserva
          </Link>
        </div>
      </header>

      {featuredSpace && (
        <section id="espacos" className="grid md:grid-cols-2 md:min-h-[620px]">
          {/* TODO(cliente): substituir por foto real do espaço. */}
          <div className="h-80 md:h-auto bg-surface-muted flex items-center justify-center text-muted-foreground text-sm">
            Foto em breve
          </div>
          <div className="flex flex-col justify-center px-8 py-16 md:px-20 md:py-14 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary">{featuredSpace.name}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{featuredSpace.description}</p>
            <Link
              href={`/reservar/${featuredSpace.slug}`}
              className="mt-8 self-center md:self-start inline-block rounded-full border border-primary text-primary px-8 py-4 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Faça uma reserva
            </Link>
          </div>
        </section>
      )}

      <section id="contato" className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Dúvidas? Fale conosco.</h2>
          <p className="mt-4 text-lg">{whatsappConfig.displayNumber}</p>
          <a
            href={`https://wa.me/${whatsappDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full border border-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-foreground hover:text-primary transition-colors"
          >
            Contato
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold text-primary">Onde estamos</h2>
        <a
          href={location.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Ver no Google Maps
        </a>
        <div className="mt-8 h-[300px] max-w-2xl mx-auto overflow-hidden rounded-lg border border-border">
          <iframe
            title="Mapa da localização da AMMA"
            src={location.embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </section>
    </div>
  );
}
