import { calendar } from "@/lib/calendar";

export default function AgendaPage() {
  return (
    <div className="flex-1 pb-12 md:pb-8">
      <div className="bg-linear-to-b from-accent-soft to-background">
        <div className="mx-auto max-w-7xl px-6 pt-8 pb-4 md:pt-12 md:pb-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[.2em] text-secondary">Agenda da sede</p>
            <h1 className="mt-3.5 text-[32px] md:text-[44px] leading-[1.1] md:leading-[1.08] font-serif font-semibold tracking-[-.02em] text-foreground">
              Disponibilidade dos espaços
            </h1>
            <p className="mt-4 max-w-[520px] text-[15px] md:text-[16.5px] leading-relaxed text-muted-foreground">
              Confira quais dias já estão ocupados antes de fazer sua reserva.
            </p>
          </div>
          <div className="flex gap-5 text-[13.5px] text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-[13px] h-[13px] rounded-[4px] bg-purple-50 border border-purple-200" />
              Ocupado
            </span>
            <span className="flex items-center gap-2">
              <span className="w-[13px] h-[13px] rounded-[4px] bg-surface border border-border/40" />
              Livre
            </span>
            <span className="flex items-center gap-2">
              <span className="w-[13px] h-[13px] rounded-[4px] bg-accent-soft border border-surface-muted" />
              Hoje
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-4 pb-6 md:pt-6">
        {calendar.isConfigured ? (
          <div className="rounded-[18px] border border-border/40 bg-surface p-2 md:p-6 overflow-hidden">
            <div className="h-[650px] w-full overflow-hidden rounded-xl">
              {/* Grade mensal: só cabe título dos eventos em telas largas. */}
              <iframe
                title="Agenda de reservas da AMMA"
                src={calendar.embedUrl}
                className="hidden md:block w-full h-full border-0"
                loading="lazy"
              />
              {/* Lista de eventos: no celular a grade do Google fica estreita
                  demais e mostra só "Ocupado", então usamos a visão de agenda. */}
              <iframe
                title="Agenda de reservas da AMMA"
                src={calendar.embedUrlMobile}
                className="block md:hidden w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">A agenda ainda não foi configurada.</p>
        )}
      </div>
    </div>
  );
}