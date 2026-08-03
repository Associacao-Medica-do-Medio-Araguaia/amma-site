// Ponto único de configuração. Cada bloco documenta quem precisa fornecer o valor real
// (cliente vs. você) e o que fica valendo enquanto isso não acontece.

export const business = {
  // 30% no ato da reserva para todos os espaços SPLIT; o restante (ou o pagamento único, para
  // espaços FULL) segue o prazo próprio de cada Space (finalDueDays). Ver prisma/schema.prisma.
  depositPercentage: 0.3,
} as const;

export const pix = {
  key: process.env.PIX_KEY ?? "15051386000138",
  merchantName: process.env.PIX_MERCHANT_NAME ?? "AMMA",
  merchantCity: process.env.PIX_MERCHANT_CITY ?? "Barra Do Garcas",
  // "Pix copia e cola" oficial fornecido pelo banco (CRC conferido) — usado como está, sem
  // reconstruir o payload, pra garantir que o QR fique idêntico ao gerado pelo banco.
  staticPayload:
    process.env.PIX_STATIC_PAYLOAD ??
    "00020126360014br.gov.bcb.pix0114150513860001385204000053039865802BR5904AMMA6015Barra Do Garcas62160512naoinformado6304B4C8",
} as const;

export const email = {
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  from: process.env.EMAIL_FROM ?? "associacaomedicadomedioaraguaia@gmail.com",
  adminNotificationEmail:
    process.env.ADMIN_NOTIFICATION_EMAIL ?? "associacaomedicadomedioaraguaia@gmail.com",
  isConfigured: Boolean(process.env.RESEND_API_KEY),
} as const;

export const whatsapp = {
  displayNumber: process.env.WHATSAPP_DISPLAY_NUMBER ?? "+55 66 99664-0443",
  // Credenciais da Meta Cloud API para envio automático do lembrete — número "verificado" no
  // WhatsApp comum não é o mesmo que ter a integração da Business Platform configurada.
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
  reminderTemplateName:
    process.env.WHATSAPP_REMINDER_TEMPLATE_NAME ?? "lembrete_pagamento_reserva",
  isConfigured: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN),
} as const;

export const googleCalendar = {
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
  // Chaves privadas em .env costumam vir com "\n" escapado — normalizamos aqui.
  privateKey: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  isConfigured: Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  ),
} as const;

export const admin = {
  password: process.env.ADMIN_PASSWORD ?? "troque-esta-senha",
} as const;

export const session = {
  // Assina o cookie de sessão do associado (HMAC). TODO(você): trocar por um valor forte
  // e secreto antes de produção.
  secret: process.env.SESSION_SECRET ?? "troque-este-segredo",
} as const;

export const googleOAuth = {
  // Client OAuth "Web application" do Google Cloud Console — diferente da Service Account
  // usada para o Calendar. Sem isso configurado, o botão "Entrar com Google" não aparece.
  clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
  redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI ?? "http://localhost:3000/api/auth/google/callback",
  isConfigured: Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET),
} as const;

export const cron = {
  secret: process.env.CRON_SECRET ?? "troque-este-segredo",
} as const;
