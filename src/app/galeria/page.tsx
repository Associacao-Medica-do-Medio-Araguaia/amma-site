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
    </div>
  );
}