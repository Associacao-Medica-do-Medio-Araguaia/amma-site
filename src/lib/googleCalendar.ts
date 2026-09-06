import { google } from "googleapis";
import { googleCalendar as googleCalendarConfig } from "@/lib/config";
import { addDaysUTC } from "@/lib/dates";

// TODO(você): depois que a Service Account estiver criada e os calendários (um por espaço)
// compartilhados com ela, remover os mocks abaixo — as funções já estão com a assinatura final,
// só falta a credencial em .env (ver GOOGLE_SERVICE_ACCOUNT_EMAIL / _PRIVATE_KEY).

// Cor do evento no Google Agenda, por espaço (todos os espaços publicam no mesmo calendário —
// ver GOOGLE_CALENDAR_EMBED_ID em src/lib/calendar.ts — então a cor é o que distingue um do outro).
// IDs de cor fixos da API do Google Calendar (colorId): https://developers.google.com/calendar/api/v3/reference/colors
const SPACE_COLOR_ID_BY_SLUG: Record<string, string> = {
  "cozinha-gourmet": "11", // Tomato (vermelho)
  "quadra-de-areia": "5", // Banana (amarelo)
  "area-externa": "7", // Peacock (azul)
  "salao-de-festa": "10", // Basil (verde)
};

export function getSpaceEventColorId(spaceSlug: string): string | undefined {
  return SPACE_COLOR_ID_BY_SLUG[spaceSlug];
}

function getCalendarClient() {
  const auth = new google.auth.JWT({
    email: googleCalendarConfig.serviceAccountEmail,
    key: googleCalendarConfig.privateKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

// A API do Google rejeita freebusy.query com "The requested time range is too long" para
// intervalos muito extensos — por isso quebramos em janelas menores e juntamos o resultado.
const FREEBUSY_MAX_WINDOW_DAYS = 60;

/** Datas (yyyy-mm-dd) já ocupadas no calendário do espaço, dentro do intervalo informado. */
export async function getBusyDates(
  calendarId: string,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<string[]> {
  if (!googleCalendarConfig.isConfigured) {
    // Sem credenciais ainda: nenhuma data bloqueada, só para não travar o fluxo em dev.
    return [];
  }

  const calendar = getCalendarClient();
  const busyDates = new Set<string>();

  let windowStart = rangeStart;
  while (windowStart < rangeEnd) {
    const windowEnd = new Date(
      Math.min(
        addDaysUTC(windowStart, FREEBUSY_MAX_WINDOW_DAYS).getTime(),
        rangeEnd.getTime(),
      ),
    );

    const { data } = await calendar.freebusy.query({
      requestBody: {
        timeMin: windowStart.toISOString(),
        timeMax: windowEnd.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    const busy = data.calendars?.[calendarId]?.busy ?? [];
    for (const slot of busy) {
      const date = slot.start?.slice(0, 10);
      if (date) busyDates.add(date);
    }

    windowStart = windowEnd;
  }

  return Array.from(busyDates);
}

/** Cria o evento da reserva confirmada no calendário do espaço. Retorna o id do evento. */
export async function createBookingEvent(params: {
  calendarId: string;
  date: Date;
  summary: string;
  description: string;
  colorId?: string;
}): Promise<string | null> {
  if (!googleCalendarConfig.isConfigured) {
    console.warn("[googleCalendar] credenciais ausentes — evento não criado (mock).");
    return null;
  }

  const calendar = getCalendarClient();
  const dateStr = params.date.toISOString().slice(0, 10);
  const nextDay = new Date(params.date);
  nextDay.setDate(nextDay.getDate() + 1);

  const { data } = await calendar.events.insert({
    calendarId: params.calendarId,
    requestBody: {
      summary: params.summary,
      description: params.description,
      colorId: params.colorId,
      start: { date: dateStr },
      end: { date: nextDay.toISOString().slice(0, 10) },
    },
  });

  return data.id ?? null;
}

export async function deleteBookingEvent(calendarId: string, eventId: string): Promise<void> {
  if (!googleCalendarConfig.isConfigured) {
    console.warn("[googleCalendar] credenciais ausentes — evento não removido (mock).");
    return;
  }

  const calendar = getCalendarClient();
  await calendar.events.delete({ calendarId, eventId });
}
