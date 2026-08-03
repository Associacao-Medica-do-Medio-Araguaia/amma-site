import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { createBookingEvent } from "@/lib/googleCalendar";
import { formatDatePtBR } from "@/lib/dates";

export async function POST(
  _request: NextRequest,
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
    googleEventId = await createBookingEvent({
      calendarId: booking.space.googleCalendarId,
      date: booking.date,
      summary: `${booking.space.name} — ${booking.member.name}`,
      description: isFullyPaid
        ? `Reserva ${booking.id}. Pagamento único confirmado.`
        : `Reserva ${booking.id}. Sinal pago, aguardando restante até ${formatDatePtBR(
            booking.finalDueDate,
          )}.`,
    });
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

  return NextResponse.json({ booking: updated });
}
