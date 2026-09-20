import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { deleteBookingEvent } from "@/lib/googleCalendar";

// Evento já removido à mão no Google Agenda: não deve impedir a exclusão da reserva.
function isEventAlreadyGone(error: unknown): boolean {
  const status =
    (error as { code?: number | string })?.code ??
    (error as { response?: { status?: number } })?.response?.status;
  return status === 404 || status === 410 || status === "404" || status === "410";
}

// Exclusão definitiva (some do banco), ao contrário do cancelamento, que mantém a reserva como
// CANCELLED. Serve para limpar reservas de teste/erradas sem deixar evento órfão no Google Agenda.
// Não gera orientação de reembolso: quem exclui uma reserva já paga precisa devolver o valor por fora.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { space: true } });
  if (!booking) {
    return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
  }

  // O evento é removido antes da linha: se o Google falhar, a reserva continua no banco com o
  // googleEventId e dá para tentar de novo. Fazendo na ordem inversa, o ID se perderia.
  if (booking.googleEventId && booking.space.googleCalendarId) {
    try {
      await deleteBookingEvent(booking.space.googleCalendarId, booking.googleEventId);
    } catch (error) {
      if (!isEventAlreadyGone(error)) {
        console.error("[delete-booking] falha ao remover evento do Google Agenda:", error);
        return NextResponse.json(
          { error: "Não foi possível remover o evento do Google Agenda. A reserva não foi excluída." },
          { status: 502 },
        );
      }
    }
  }

  await prisma.booking.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
