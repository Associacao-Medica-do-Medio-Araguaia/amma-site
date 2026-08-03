import { whatsapp as whatsappConfig } from "@/lib/config";

// TODO(você): só funciona depois que a conta WhatsApp Business estiver verificada na Meta e o
// template "WHATSAPP_REMINDER_TEMPLATE_NAME" (ver .env.example) estiver aprovado. O template
// precisa ter exatamente os parâmetros de texto usados em `bodyParams` abaixo, na mesma ordem,
// e um componente de cabeçalho de imagem para o QR code (params.qrCodeImageUrl precisa ser uma
// URL pública, não um data URI).
export async function sendPaymentReminderWhatsapp(params: {
  toPhoneE164: string; // ex. "5565999999999" (sem "+", sem espaços)
  customerName: string;
  spaceName: string;
  dateFormatted: string;
  remainingAmountFormatted: string;
  pixCopyPaste: string;
  qrCodeImageUrl: string;
}) {
  if (!whatsappConfig.isConfigured) {
    console.warn("[whatsapp] credenciais ausentes — lembrete não enviado (mock):", params);
    return { mocked: true };
  }

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${whatsappConfig.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappConfig.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: params.toPhoneE164,
        type: "template",
        template: {
          name: whatsappConfig.reminderTemplateName,
          language: { code: "pt_BR" },
          components: [
            {
              type: "header",
              parameters: [{ type: "image", image: { link: params.qrCodeImageUrl } }],
            },
            {
              type: "body",
              parameters: [
                { type: "text", text: params.customerName },
                { type: "text", text: params.spaceName },
                { type: "text", text: params.dateFormatted },
                { type: "text", text: params.remainingAmountFormatted },
                { type: "text", text: params.pixCopyPaste },
              ],
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao enviar WhatsApp (${response.status}): ${body}`);
  }

  return response.json();
}
