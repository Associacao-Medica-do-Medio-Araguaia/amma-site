import { Resend } from "resend";
import { email as emailConfig } from "@/lib/config";

// TODO(cliente/você): sem RESEND_API_KEY + domínio verificado, os e-mails só são logados
// no console (útil em dev). Ver .env.example.

export async function sendEmail(params: { to: string; subject: string; html: string }) {
  if (!emailConfig.isConfigured) {
    console.warn("[email] RESEND_API_KEY ausente — e-mail não enviado (mock):", params);
    return { mocked: true };
  }

  const resend = new Resend(emailConfig.resendApiKey);
  const result = await resend.emails.send({
    from: emailConfig.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  // O SDK do Resend não lança exceção em erros da API (ex. domínio não verificado) — só
  // devolve { error }. Sem este throw, quem chama (ex. o cron de lembretes) achava que o
  // e-mail tinha saído e nunca tentava de novo.
  if (result.error) {
    throw new Error(`Falha ao enviar e-mail via Resend: ${result.error.message}`);
  }
  return result;
}

export function paymentReminderEmailHtml(params: {
  customerName: string;
  spaceName: string;
  date: string;
  remainingAmountFormatted: string;
  pixCopyPaste: string;
}) {
  return `
    <p>Olá, ${params.customerName}!</p>
    <p>Faltam 5 dias para a sua reserva de <strong>${params.spaceName}</strong> em <strong>${params.date}</strong>.</p>
    <p>Ainda falta pagar <strong>${params.remainingAmountFormatted}</strong> via Pix para confirmar a reserva.</p>
    <p>Pix copia e cola:</p>
    <pre style="white-space: pre-wrap; word-break: break-all;">${params.pixCopyPaste}</pre>
    <p>Depois de pagar, envie o comprovante por este e-mail ou pelo nosso WhatsApp.</p>
    <p>Se o pagamento não for identificado até a data da reserva, ela será cancelada automaticamente.</p>
  `;
}
