import { calendar } from "@/lib/calendar";

export default function AgendaPage() {
  return (
    <div className="flex-1 mx-auto max-w-3xl px-6 py-12 w-full text-center">
      <h1 className="text-2xl font-semibold text-primary">Agenda</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Confira abaixo quais dias já estão ocupados antes de fazer sua reserva.
      </p>

      {calendar.isConfigured ? (
        <div className="mt-8 h-[650px] w-full overflow-hidden rounded-lg border border-border">
          <iframe
            title="Agenda de reservas da AMMA"
            src={calendar.embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          A agenda ainda não foi configurada.
        </p>
      )}
    </div>
  );
}
