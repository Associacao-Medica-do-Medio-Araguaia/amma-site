import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
  }
  if (booking.status !== "AWAITING_FINAL_PAYMENT") {
    return NextResponse.json(
      { error: "Reserva não está aguardando pagamento final." },
      { status: 409 },
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CONFIRMED", finalPaidAt: new Date() },
  });

  return NextResponse.json({ booking: updated });
}
