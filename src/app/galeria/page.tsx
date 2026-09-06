import GalleryGrid from "@/components/GalleryGrid";

const GALLERY_PHOTOS = [
  { id: 1, src: "/fotos/patio-piscina.jpg", alt: "Área de mesas à beira da piscina", span: "row-span-2" },
  { id: 2, src: "/fotos/piscina.jpg", alt: "Piscina iluminada à noite", span: "" },
  { id: 3, src: "/fotos/cozinha.jpg", alt: "Cozinha gourmet equipada", span: "" },
  { id: 4, src: "/fotos/fachada.jpg", alt: "Fachada do salão de eventos à noite", span: "row-span-2" },
  { id: 5, src: "/fotos/redario.jpg", alt: "Redário sob as árvores", span: "" },
  { id: 6, src: "/fotos/salao-eventos.jpg", alt: "Salão de eventos decorado", span: "" },
];

export default function GaleriaPage() {
  return (
    <div className="flex-1 mx-auto max-w-5xl px-6 py-12 w-full">
      <h1 className="text-2xl font-semibold text-primary">Galeria de Fotos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Conheça um pouco dos nossos espaços e eventos. Clique em uma foto para ver em tela cheia.
      </p>

      <GalleryGrid photos={GALLERY_PHOTOS} />
    </div>
  );
}
