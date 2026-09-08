import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { whatsapp as whatsappConfig } from "@/lib/config";
import { location } from "@/lib/location";

export const dynamic = "force-dynamic";

// TODO(cliente): trocar o espaço em destaque se quiser outro além do Redário.
// O Redário não é um espaço próprio — faz parte da Área Externa (ver prisma/seed.ts) — por
// isso o texto abaixo é específico para ele, mas o link de reserva aponta para Área Externa.
const FEATURED_SPACE_SLUG = "area-externa";

export default async function HomePage() {
  const featuredSpace = await prisma.space.findUnique({ where: { slug: FEATURED_SPACE_SLUG } });
  const whatsappDigits = whatsappConfig.displayNumber.replace(/\D/g, "");

  return (
    <div className="flex-1">
      <header className="relative isolate overflow-hidden text-background">
        {/* Fachada em tons de cinza + camada azul (multiply) por cima = efeito "silhueta". */}
        <div className="absolute inset-0 -z-20 bg-[url('/fotos/fachada.jpg')] bg-cover bg-center grayscale contrast-125 brightness-[.55]" />
        <div className="absolute inset-0 -z-10 bg-foreground/70 mix-blend-multiply" />
        <div className="absolute inset-0 -z-10 bg-foreground/30" />
        <div className="mx-auto max-w-5xl px-6 py-28 sm:py-36 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Associação Médica do Médio Araguaia
          </h1>
          <p className="mt-4 text-base sm:text-lg opacity-90">
            Desde 1981, reunimos os médicos associados de Pontal do Araguaia e região — um espaço
            pensado para o bem-estar, a confraternização e o convívio entre colegas e famílias.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#historia"
              className="inline-block rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Conheça nossa história
            </a>
          </div>
        </div>
      </header>

      <section id="historia" className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Nossa história
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-semibold text-primary">Quem somos</h2>
          {/* TODO(cliente): expandir com a história completa da AMMA (fatos, marcos, fotos antigas). */}
          <p className="mt-4 text-muted-foreground">
            Fundada em 1981, a Associação Médica do Médio Araguaia (AMMA) reúne há mais de quatro
            décadas os médicos associados de Barra do Garças e Pontal do Araguaia, promovendo
            confraternização, bem-estar e apoio à categoria médica.
          </p>
          <p className="mt-4 text-muted-foreground">
            Nossa sede conta com área externa, piscina, salão de eventos e cozinha equipada — espaços
            reservados exclusivamente para uso dos nossos associados e seus convidados.
          </p>
          <Link href="/institucional" className="mt-6 inline-block text-primary hover:underline text-sm font-medium">
            Conheça nossa diretoria e estatuto →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative h-40 rounded-xl overflow-hidden bg-surface-muted">
            <Image src="/fotos/patio-piscina.jpg" alt="Área de mesas à beira da piscina" fill className="object-cover" />
          </div>
          <div className="relative h-40 rounded-xl overflow-hidden bg-surface-muted">
            <Image src="/fotos/salao-eventos.jpg" alt="Salão de eventos decorado" fill className="object-cover" />
          </div>
          <div className="relative h-40 rounded-xl overflow-hidden bg-surface-muted">
            <Image src="/fotos/cozinha.jpg" alt="Cozinha gourmet equipada" fill className="object-cover" />
          </div>
          <div className="relative h-40 rounded-xl overflow-hidden bg-surface-muted">
            <Image src="/fotos/piscina.jpg" alt="Piscina iluminada à noite" fill className="object-cover" />
          </div>
        </div>
        <Link
          href="/galeria"
          className="md:col-span-2 -mt-2 text-sm text-primary hover:underline text-center md:text-left"
        >
          Ver galeria completa →
        </Link>
      </section>

      {featuredSpace && (
        <section id="espacos" className="grid md:grid-cols-2 md:min-h-[620px]">
          <div className="relative h-80 md:h-auto bg-surface-muted">
            <Image src="/fotos/redario.jpg" alt="Redário sob as árvores" fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center px-8 py-16 md:px-20 md:py-14 text-center md:text-left">
            <span className="self-center md:self-start inline-block rounded-full bg-amber-100 text-amber-900 text-xs font-bold px-2 py-1 mb-3">
              Exclusivo para médicos associados
            </span>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Área Externa
            </p>
            <h2 className="mt-1 text-3xl md:text-4xl font-semibold text-primary">Redário</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Balance na rede à sombra das árvores e desacelere no seu tempo — um cantinho de
              descanso na Área Externa, que também tem piscina, quadra de areia e
              churrasqueira.
            </p>
            <Link
              href={`/reservar/${featuredSpace.slug}`}
              className="mt-8 self-center md:self-start inline-block rounded-full border border-primary text-primary px-8 py-4 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Reserve a Área Externa
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
