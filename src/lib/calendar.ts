const embedId = process.env.GOOGLE_CALENDAR_EMBED_ID ?? "associacaomedicadomedioaraguai@gmail.com";

const embedParams = new URLSearchParams({
  src: embedId,
  ctz: "America/Sao_Paulo",
  wkst: "1", // semana começa na segunda-feira
  showPrint: "0",
  title: "RESERVA",
  color: "#039be5",
});

export const calendar = {
  embedId,
  embedUrl: `https://calendar.google.com/calendar/embed?${embedParams.toString()}`,
  isConfigured: Boolean(embedId),
} as const;
