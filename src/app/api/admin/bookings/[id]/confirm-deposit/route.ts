import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { createBookingEvent, getSpaceEventColorId } from "@/lib/googleCalendar";
import { formatDatePtBR } from "@/lib/dates";
import { sendEmail, depositConfirmedEmailHtml } from "@/lib/email";
import { formatCentsToBRL } from "@/lib/money";
import { buildStaticPixPayload, buildPixCopyPageUrl, buildPixQrCodeImageUrl } from "@/lib/pix";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { space: true, member: true },
  });
  if (!booking) {
    return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
  }
  if (booking.status !== "AWAITING_DEPOSIT") {
    return NextResponse.json({ error: "Reserva não está aguardando sinal." }, { status: 409 });
  }

  // Espaços com pagamento único (ex. quadra) não têm um segundo pagamento: confirmar o sinal
  // já confirma a reserva inteira.
  const isFullyPaid = booking.finalCents === 0;

  let googleEventId: string | null = null;
  if (booking.space.googleCalendarId) {
    const timeRangeLabel =
      booking.shiftLabel ??
      (booking.startHour != null && booking.hours != null
        ? `${booking.startHour}h às ${booking.startHour + booking.hours}h`
        : null);

    try {
      googleEventId = await createBookingEvent({
        calendarId: booking.space.googleCalendarId,
        date: booking.date,
        colorId: getSpaceEventColorId(booking.space.slug),
        summary: timeRangeLabel
          ? `${booking.space.name}: ${booking.member.name} (${timeRangeLabel})`
          : `${booking.space.name}: ${booking.member.name}`,
        description: isFullyPaid
          ? `Reserva ${booking.id}. Pagamento único confirmado.`
          : `Reserva ${booking.id}. Sinal pago, aguardando restante até ${formatDatePtBR(
              booking.finalDueDate,
            )}.`,
      });
    } catch (error) {
      // Não deixa uma falha na integração com o Google Agenda travar a confirmação do
      // pagamento — a reserva continua sendo confirmada mesmo sem o evento no calendário.
      console.error("[confirm-deposit] falha ao criar evento no Google Agenda:", error);
    }
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: isFullyPaid ? "CONFIRMED" : "AWAITING_FINAL_PAYMENT",
      depositPaidAt: new Date(),
      ...(isFullyPaid ? { finalPaidAt: new Date() } : {}),
      ...(googleEventId ? { googleEventId } : {}),
    },
  });

  try {
    const pixCopyPaste = buildStaticPixPayload();
    const remainingAmountFormatted = formatCentsToBRL(booking.finalCents);
    await sendEmail({
      to: booking.member.email,
      subject: isFullyPaid
        ? "🎉 Pagamento confirmado — reserva garantida"
        : "🎉 Sinal confirmado — reserva garantida",
      html: depositConfirmedEmailHtml({
        customerName: booking.member.name,
        spaceName: booking.space.name,
        date: formatDatePtBR(booking.date),
        fullyPaid: isFullyPaid,
        ...(isFullyPaid
          ? {}
          : {
              remainingAmountFormatted,
              dueDateFormatted: formatDatePtBR(booking.finalDueDate),
              pixCopyPaste,
              qrCodeImageUrl: buildPixQrCodeImageUrl(request.nextUrl.origin),
              copyUrl: buildPixCopyPageUrl(request.nextUrl.origin, pixCopyPaste, remainingAmountFormatted),
            }),
      }),
    });
  } catch (error) {
    console.error("[confirm-deposit] falha ao enviar e-mail de confirmação:", error);
  }

  return NextResponse.json({ booking: updated });
}
