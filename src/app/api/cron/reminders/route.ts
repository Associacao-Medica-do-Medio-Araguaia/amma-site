import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";
import { buildStaticPixPayload } from "@/lib/pix";
import { formatCentsToBRL } from "@/lib/money";
import { formatDatePtBR, startOfDayUTC } from "@/lib/dates";
import { sendEmail, paymentReminderEmailHtml } from "@/lib/email";
import { sendPaymentReminderWhatsapp } from "@/lib/whatsapp";
import { toWhatsappE164 } from "@/lib/phone";

// Deve ser chamada uma vez por dia por um agendador externo (ver src/lib/cronAuth.ts).
// Envia o lembrete de pagamento para reservas cujo vencimento já chegou e ainda não receberam
// lembrete — tanto o saldo de 70% (espaços SPLIT, status AWAITING_FINAL_PAYMENT) quanto o
// pagamento único ainda não pago (espaços FULL, ex. quadra — continuam em AWAITING_DEPOSIT).
// Vercel Cron chama com GET e injeta "Authorization: Bearer $CRON_SECRET" automaticamente
// (ver vercel.json) — por isso o método aqui é GET, não POST.
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const today = startOfDayUTC(new Date());

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { status: "AWAITING_FINAL_PAYMENT" },
        { status: "AWAITING_DEPOSIT", finalCents: 0 },
      ],
      finalDueDate: { lte: today },
      finalReminderSentAt: null,
    },
    include: { space: true, member: true },
  });

  const pixCopyPaste = buildStaticPixPayload();
  const qrCodeImageUrl = new URL("/api/pix-qrcode.png", request.nextUrl.origin).toString();

  const results: { bookingId: string; ok: boolean; error?: string }[] = [];

  for (const booking of bookings) {
    const amountDueCents = booking.status === "AWAITING_DEPOSIT" ? booking.depositCents : booking.finalCents;
    try {
      await sendEmail({
        to: booking.member.email,
        subject: "Falta pagar sua reserva",
        html: paymentReminderEmailHtml({
          customerName: booking.member.name,
          spaceName: booking.space.name,
          date: formatDatePtBR(booking.date),
          remainingAmountFormatted: formatCentsToBRL(amountDueCents),
          pixCopyPaste,
        }),
      });

      await sendPaymentReminderWhatsapp({
        toPhoneE164: toWhatsappE164(booking.member.phone ?? ""),
        customerName: booking.member.name,
        spaceName: booking.space.name,
        dateFormatted: formatDatePtBR(booking.date),
        remainingAmountFormatted: formatCentsToBRL(amountDueCents),
        pixCopyPaste,
        qrCodeImageUrl,
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: { finalReminderSentAt: new Date() },
      });

      results.push({ bookingId: booking.id, ok: true });
    } catch (error) {
      results.push({ bookingId: booking.id, ok: false, error: String(error) });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
