import { Maximize2 } from "lucide-react";
import GalleryGrid from "@/components/GalleryGrid";

const GALLERY_PHOTOS = [
  { id: 1, src: "/fotos/patio-piscina.jpg", alt: "Área de mesas à beira da piscina" },
  { id: 2, src: "/fotos/piscina.jpg", alt: "Piscina iluminada à noite" },
  { id: 3, src: "/fotos/cozinha.jpg", alt: "Cozinha gourmet equipada" },
  { id: 4, src: "/fotos/fachada.jpg", alt: "Fachada do salão de eventos à noite" },
  { id: 5, src: "/fotos/redario.jpg", alt: "Redário sob as árvores" },
  { id: 6, src: "/fotos/salao-eventos.jpg", alt: "Salão de eventos decorado" },
];

const JANTAR_PHOTOS = [
  { id: 1, src: "/fotos/jantar-medico/Photo.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 2, src: "/fotos/jantar-medico/Photo-2.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 3, src: "/fotos/jantar-medico/Photo-3.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 4, src: "/fotos/jantar-medico/Photo-4.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 5, src: "/fotos/jantar-medico/Photo-5.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 6, src: "/fotos/jantar-medico/Photo-6.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 7, src: "/fotos/jantar-medico/Photo-7.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 8, src: "/fotos/jantar-medico/Photo-8.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 9, src: "/fotos/jantar-medico/Photo-9.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 10, src: "/fotos/jantar-medico/Photo-10.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 11, src: "/fotos/jantar-medico/Photo-11.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 12, src: "/fotos/jantar-medico/Photo-12.jpg", alt: "Jantar do Dia do Médico 2026" },
  // fazer ate o 38
  { id: 13, src: "/fotos/jantar-medico/Photo-13.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 14, src: "/fotos/jantar-medico/Photo-14.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 15, src: "/fotos/jantar-medico/Photo-15.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 16, src: "/fotos/jantar-medico/Photo-16.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 17, src: "/fotos/jantar-medico/Photo-17.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 18, src: "/fotos/jantar-medico/Photo-18.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 19, src: "/fotos/jantar-medico/Photo-19.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 20, src: "/fotos/jantar-medico/Photo-20.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 21, src: "/fotos/jantar-medico/Photo-21.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 22, src: "/fotos/jantar-medico/Photo-22.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 23, src: "/fotos/jantar-medico/Photo-23.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 24, src: "/fotos/jantar-medico/Photo-24.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 25, src: "/fotos/jantar-medico/Photo-25.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 26, src: "/fotos/jantar-medico/Photo-26.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 27, src: "/fotos/jantar-medico/Photo-27.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 28, src: "/fotos/jantar-medico/Photo-28.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 29, src: "/fotos/jantar-medico/Photo-29.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 30, src: "/fotos/jantar-medico/Photo-30.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 31, src: "/fotos/jantar-medico/Photo-31.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 32, src: "/fotos/jantar-medico/Photo-32.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 33, src: "/fotos/jantar-medico/Photo-33.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 34, src: "/fotos/jantar-medico/Photo-34.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 35, src: "/fotos/jantar-medico/Photo-35.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 36, src: "/fotos/jantar-medico/Photo-36.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 37, src: "/fotos/jantar-medico/Photo-37.jpg", alt: "Jantar do Dia do Médico 2026" },
  { id: 38, src: "/fotos/jantar-medico/Photo-38.jpg", alt: "Jantar do Dia do Médico 2026" },
];

export default function GaleriaPage() {
  return (
    <div className="flex-1 pb-12 md:pb-8">
      <div className="bg-linear-to-b from-accent-soft to-background">
        <div className="mx-auto max-w-7xl px-6 pt-8 pb-4 md:pt-12 md:pb-6">
          <p className="text-[11.5px] font-semibold uppercase tracking-[.2em] text-secondary">Galeria de fotos</p>
          <h1 className="mt-3.5 text-[32px] md:text-[44px] leading-[1.1] md:leading-[1.08] font-serif font-semibold tracking-[-.02em] text-foreground">
            A sede, por dentro
          </h1>
          <p className="mt-4 text-[15px] md:text-[16.5px] leading-relaxed text-muted-foreground">
            Conheça um pouco dos nossos espaços e eventos. Clique em uma foto para ver em tela
            cheia.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-4 pb-6 md:pt-0">
        <GalleryGrid photos={GALLERY_PHOTOS} />

        <div className="mt-[26px] flex items-center gap-3.5 rounded-2xl border border-border/40 bg-surface px-5 py-4">
          <span className="shrink-0 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-accent-soft text-secondary">
            <Maximize2 className="h-4 w-4" />
          </span>
          <p className="text-[14.5px] leading-snug text-muted-foreground">
            Em tela cheia: setas do teclado ou arraste lateral no celular para navegar,{" "}
            <strong className="text-foreground">Esc</strong> para fechar.
          </p>
        </div>
      </div>
      {/* após a primeira galeria */}
      <section className="mx-auto max-w-7xl px-6 pt-4 pb-6 md:pt-0">
        <h2 className="mt-3.5 text-[32px] md:text-[44px] leading-[1.1] md:leading-[1.08] font-serif font-semibold tracking-[-.02em] text-foreground">
          Jantar Dia do Médico 2026
        </h2>
        <GalleryGrid photos={JANTAR_PHOTOS} />
      </section>
    </div>
  );
}