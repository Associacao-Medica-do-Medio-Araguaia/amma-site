import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { deleteBookingEvent } from "@/lib/googleCalendar";
import { formatCentsToBRL } from "@/lib/money";

type CancelledBy = "CUSTOMER" | "ADMIN";

// Política informada pela AMMA: se o associado cancela, só os 70% (se já pagos) são
// devolvidos — os 30% do sinal ficam retidos como taxa de limpeza. Se a AMMA cancela, devolve
// tudo o que já tiver sido pago. Isso é só orientação para o admin: o Pix é manual, então
// quem executa a devolução é uma pessoa, não o sistema.
function refundGuidance(
  cancelledBy: CancelledBy,
  booking: { depositPaidAt: Date | null; finalPaidAt: Date | null; depositCents: number; finalCents: number },
): string {
  const paidCents = booking.finalPaidAt
    ? booking.depositCents + booking.finalCents
    : booking.depositPaidAt
      ? booking.depositCents
      : 0;

  if (paidCents === 0) return "Nenhum valor foi pago — nada a devolver.";

  if (cancelledBy === "ADMIN") {
    return `Cancelada pela AMMA: devolver ${formatCentsToBRL(paidCents)} (tudo o que foi pago).`;
  }

  if (!booking.finalPaidAt) {
    return "Cancelada pelo associado: só o sinal (30%) foi pago — fica retido como taxa de limpeza, nada a devolver.";
  }
  return `Cancelada pelo associado: devolver ${formatCentsToBRL(booking.finalCents)} (o saldo de 70% já pago). O sinal de 30% fica retido como taxa de limpeza.`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const { cancelledBy } = (await request.json().catch(() => ({}))) as {
    cancelledBy?: CancelledBy;
  };
  if (cancelledBy !== "CUSTOMER" && cancelledBy !== "ADMIN") {
    return NextResponse.json({ error: "Informe quem está cancelando." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id }, include: { space: true } });
  if (!booking) {
    return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
  }
  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Reserva já está cancelada." }, { status: 409 });
  }

  if (booking.googleEventId && booking.space.googleCalendarId) {
    await deleteBookingEvent(booking.space.googleCalendarId, booking.googleEventId);
  }

  const guidance = refundGuidance(cancelledBy, booking);
  const cancelledReason =
    cancelledBy === "ADMIN"
      ? `Cancelada pela administração da AMMA. ${guidance}`
      : `Cancelada a pedido do associado. ${guidance}`;

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelledReason,
    },
  });

  return NextResponse.json({ booking: updated });
}
