import { location } from "@/lib/location";

export default function LocalizacaoPage() {
  return (
    <div className="flex-1 mx-auto max-w-3xl px-6 py-12 w-full text-center">
      <h1 className="text-2xl font-semibold text-primary">Localização</h1>

      <div className="mt-4">
        {location.addressLines.map((line) => (
          <p key={line} className="text-muted-foreground">
            {line}
          </p>
        ))}
      </div>

      <a
        href={location.googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-primary hover:underline"
      >
        Ver no Google Maps
      </a>

      <div className="mt-8 h-[300px] w-full overflow-hidden rounded-lg border border-border">
        <iframe
          title="Mapa da localização da AMMA"
          src={location.embedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}