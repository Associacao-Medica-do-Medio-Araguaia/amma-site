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

// Layout compartilhado dos e-mails (cores da marca AMMA). Estilo é sempre inline porque a
// maioria dos clientes de e-mail ignora <style> em <head>.
function emailLayout(params: { headerLabel: string; headerColor: string; bodyHtml: string }) {
  return `
    <div style="background:#f6f8f8; padding:24px 12px; font-family:Arial, Helvetica, sans-serif;">
      <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8ec;">
        <div style="background:${params.headerColor}; padding:18px 24px;">
          <p style="margin:0; color:#ffffff; font-size:13px; font-weight:bold; letter-spacing:0.04em; text-transform:uppercase;">
            ${params.headerLabel}
          </p>
        </div>
        <div style="padding:24px; color:#113959; font-size:15px; line-height:1.55;">
          ${params.bodyHtml}
        </div>
        <div style="padding:16px 24px; background:#f6f8f8; color:#285a76; font-size:12px;">
          Associação Médica do Médio Araguaia (AMMA)
        </div>
      </div>
    </div>
  `;
}

function pixBlock(params: {
  amountFormatted: string;
  pixCopyPaste: string;
  qrCodeImageUrl: string;
  copyUrl: string;
  amountLabel?: string;
}) {
  return `
    <div style="margin-top:16px; padding:16px; background:#f6f8f8; border-radius:8px; text-align:center;">
      <p style="margin:0; font-size:12px; color:#285a76; text-transform:uppercase; letter-spacing:0.03em;">
        ${params.amountLabel ?? "Valor a pagar"}
      </p>
      <p style="margin:4px 0 0; font-size:28px; font-weight:bold; color:#113959;">
        ${params.amountFormatted}
      </p>
      <img
        src="${params.qrCodeImageUrl}"
        width="180"
        height="180"
        alt="QR Code Pix"
        style="margin:14px auto 0; display:block; border-radius:8px; border:1px solid #e2e8ec;"
      />
      <p style="margin:14px 0 4px; font-size:12px; color:#285a76;">Pix copia e cola</p>
      <p style="margin:0; font-size:12px; font-family:monospace; word-break:break-all; background:#ffffff; border:1px solid #e2e8ec; border-radius:6px; padding:8px;">
        ${params.pixCopyPaste}
      </p>
      <a
        href="${params.copyUrl}"
        style="display:inline-block; margin-top:12px; background:#14989d; color:#ffffff; text-decoration:none; font-weight:bold; font-size:14px; padding:10px 22px; border-radius:6px;"
      >
        📋 Copiar código Pix
      </a>
    </div>
  `;
}

export function paymentReminderEmailHtml(params: {
  customerName: string;
  spaceName: string;
  date: string;
  dueDateFormatted: string;
  remainingAmountFormatted: string;
  pixCopyPaste: string;
  qrCodeImageUrl: string;
  copyUrl: string;
}) {
  return emailLayout({
    headerLabel: "⚠️ Pagamento pendente — atenção",
    headerColor: "#c02626",
    bodyHtml: `
      <p style="margin:0 0 12px;">Olá, ${params.customerName}!</p>
      <p style="margin:0 0 12px;">
        Sua reserva de <strong>${params.spaceName}</strong> em <strong>${params.date}</strong>
        ainda tem um pagamento em aberto.
      </p>
      <div style="margin:16px 0; padding:12px 16px; background:#fdecec; border:1px solid #f3b8b8; border-radius:8px;">
        <p style="margin:0; color:#c02626; font-weight:bold;">
          Prazo de pagamento: ${params.dueDateFormatted}
        </p>
      </div>
      ${pixBlock({
        amountFormatted: params.remainingAmountFormatted,
        pixCopyPaste: params.pixCopyPaste,
        qrCodeImageUrl: params.qrCodeImageUrl,
        copyUrl: params.copyUrl,
      })}
      <p style="margin:16px 0 0;">
        Depois de pagar, envie o comprovante por este e-mail ou pelo nosso WhatsApp.
      </p>
      <p style="margin:12px 0 0; font-weight:bold; color:#c02626;">
        Se o pagamento não for identificado até o prazo acima, a reserva será cancelada
        automaticamente.
      </p>
    `,
  });
}

export function bookingReceivedEmailHtml(params: {
  customerName: string;
  spaceName: string;
  date: string;
  amountDueFormatted: string;
  pixCopyPaste: string;
  qrCodeImageUrl: string;
  copyUrl: string;
  bookingId: string;
}) {
  return emailLayout({
    headerLabel: "✅ Reserva recebida",
    headerColor: "#14989d",
    bodyHtml: `
      <p style="margin:0 0 12px;">Olá, ${params.customerName}!</p>
      <p style="margin:0 0 12px;">
        Recebemos sua reserva de <strong>${params.spaceName}</strong> em
        <strong>${params.date}</strong>.
      </p>
      ${pixBlock({
        amountFormatted: params.amountDueFormatted,
        pixCopyPaste: params.pixCopyPaste,
        qrCodeImageUrl: params.qrCodeImageUrl,
        copyUrl: params.copyUrl,
        amountLabel: "Valor a pagar agora",
      })}
      <p style="margin:16px 0 0;">
        Depois de pagar, envie o comprovante por este e-mail ou pelo nosso WhatsApp.
      </p>
      <p style="margin:12px 0 0; color:#285a76;">
        Assim que identificarmos o pagamento, vamos confirmar sua reserva por e-mail.
      </p>
    `,
  });
}

export function depositConfirmedEmailHtml(params: {
  customerName: string;
  spaceName: string;
  date: string;
  fullyPaid: boolean;
  remainingAmountFormatted?: string;
  dueDateFormatted?: string;
  pixCopyPaste?: string;
  qrCodeImageUrl?: string;
  copyUrl?: string;
}) {
  const pendingBlock =
    !params.fullyPaid && params.remainingAmountFormatted && params.dueDateFormatted
      ? `
        <div style="margin:16px 0; padding:12px 16px; background:#fff4e0; border:1px solid #f2cf8f; border-radius:8px;">
          <p style="margin:0 0 4px; color:#8a5a00; font-weight:bold;">
            Falta pagar ${params.remainingAmountFormatted}
          </p>
          <p style="margin:0; color:#8a5a00;">
            Você tem até <strong>${params.dueDateFormatted}</strong> para pagar o restante. Se o
            pagamento não for identificado até essa data, a reserva será cancelada
            automaticamente.
          </p>
        </div>
        ${
          params.pixCopyPaste && params.qrCodeImageUrl && params.copyUrl
            ? pixBlock({
                amountFormatted: params.remainingAmountFormatted,
                pixCopyPaste: params.pixCopyPaste,
                qrCodeImageUrl: params.qrCodeImageUrl,
                copyUrl: params.copyUrl,
                amountLabel: "Valor restante",
              })
            : ""
        }
      `
      : `
        <div style="margin:16px 0; padding:12px 16px; background:#e8f7f0; border:1px solid #a9e0c6; border-radius:8px;">
          <p style="margin:0; color:#137f5a; font-weight:bold;">
            Pagamento completo — sua reserva está totalmente confirmada!
          </p>
        </div>
      `;

  return emailLayout({
    headerLabel: "🎉 Pagamento confirmado",
    headerColor: "#14989d",
    bodyHtml: `
      <p style="margin:0 0 12px;">Olá, ${params.customerName}!</p>
      <p style="margin:0 0 12px;">
        Confirmamos o pagamento da sua reserva de <strong>${params.spaceName}</strong> em
        <strong>${params.date}</strong>.
      </p>
      ${pendingBlock}
    `,
  });
}
