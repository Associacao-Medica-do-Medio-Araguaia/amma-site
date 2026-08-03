import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";
import { deleteBookingEvent } from "@/lib/googleCalendar";
import { startOfDayUTC } from "@/lib/dates";

// Deve ser chamada uma vez por dia por um agendador externo (ver src/lib/cronAuth.ts).
// Cancela reservas cujo prazo de pagamento já passou sem confirmação — tanto o saldo de 70%
// (espaços SPLIT, AWAITING_FINAL_PAYMENT) quanto o pagamento único não pago (espaços FULL,
// ex. quadra — continuam em AWAITING_DEPOSIT).
// Vercel Cron chama com GET e injeta "Authorization: Bearer $CRON_SECRET" automaticamente
// (ver vercel.json) — por isso o método aqui é GET, não POST.
export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const today = startOfDayUTC(new Date());

  const overdueBookings = await prisma.booking.findMany({
    where: {
      OR: [
        { status: "AWAITING_FINAL_PAYMENT" },
        { status: "AWAITING_DEPOSIT", finalCents: 0 },
      ],
      finalDueDate: { lt: today },
    },
    include: { space: true },
  });

  const cancelledIds: string[] = [];

  for (const booking of overdueBookings) {
    if (booking.googleEventId && booking.space.googleCalendarId) {
      await deleteBookingEvent(booking.space.googleCalendarId, booking.googleEventId);
    }
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledReason:
          booking.status === "AWAITING_DEPOSIT"
            ? "Pagamento não identificado até o prazo."
            : "Pagamento do restante não identificado até o prazo.",
      },
    });
    cancelledIds.push(booking.id);
  }

  return NextResponse.json({ cancelled: cancelledIds });
}
