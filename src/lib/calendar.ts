const embedId = process.env.GOOGLE_CALENDAR_EMBED_ID ?? "associacaomedicadomedioaraguai@gmail.com";

const baseEmbedParams = {
  src: embedId,
  ctz: "America/Sao_Paulo",
  wkst: "1", // semana começa na segunda-feira
  showPrint: "0",
  title: "RESERVA",
  color: "#8E24AA",
  // O widget de embed público do Google Agenda (calendar/embed) sempre pinta os eventos com
  // UMA cor só por calendário (essa aqui, ou a cor padrão do calendário se omitida) — ele não
  // respeita o colorId de cada evento como o app/site normal do Google Agenda faz. Testado:
  // eventos com colorId diferentes (5, 7, 10, 11) apareceram todos iguais no embed. Isso é uma
  // limitação do próprio widget do Google, não do código daqui — as cores por espaço só
  // aparecem corretamente ao abrir o Google Agenda de verdade (calendar.google.com), como já
  // validado via API.
};

function buildEmbedUrl(mode?: "AGENDA") {
  const params = new URLSearchParams(baseEmbedParams);
  if (mode) params.set("mode", mode);
  return `https://calendar.google.com/calendar/embed?${params.toString()}`;
}

export const calendar = {
  embedId,
  // Visão de mês (grade): funciona bem em telas largas.
  embedUrl: buildEmbedUrl(),
  // Visão de agenda (lista): no widget do Google, a grade mensal fica estreita
  // demais no celular e os eventos aparecem só como "Ocupado" sem título. A
  // lista mostra o título mesmo em telas pequenas, então é usada no mobile.
  embedUrlMobile: buildEmbedUrl("AGENDA"),
  isConfigured: Boolean(embedId),
} as const;
