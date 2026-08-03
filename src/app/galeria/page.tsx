// TODO(cliente): substituir os placeholders abaixo pelas fotos reais da associação.
const GALLERY_PLACEHOLDERS = [
  { id: 1, span: "row-span-2" },
  { id: 2, span: "" },
  { id: 3, span: "" },
  { id: 4, span: "row-span-2" },
  { id: 5, span: "" },
  { id: 6, span: "" },
  { id: 7, span: "" },
  { id: 8, span: "row-span-2" },
  { id: 9, span: "" },
];

export default function GaleriaPage() {
  return (
    <div className="flex-1 mx-auto max-w-5xl px-6 py-12 w-full">
      <h1 className="text-2xl font-semibold text-primary">Galeria de Fotos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Conheça um pouco dos nossos espaços e eventos.
      </p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-[160px]">
        {GALLERY_PLACEHOLDERS.map((photo) => (
          <div
            key={photo.id}
            className={`${photo.span} rounded-xl bg-surface-muted border border-border flex items-center justify-center text-sm text-muted-foreground`}
          >
            Foto em breve
          </div>
        ))}
      </div>
    </div>
  );
}
