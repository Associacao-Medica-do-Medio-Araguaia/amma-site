import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDateOnly } from "@/lib/dates";
import { EXCLUSIVE_VENUE_BUFFER_HOURS } from "@/lib/spaceRules";

// Usado pelo seletor de horário da Quadra de Areia: mostra os intervalos já reservados nesse dia
// e, se houver um evento exclusivo (Salão/Área Externa/Cozinha) na mesma data, até que hora dá
// para usar a quadra antes dele.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const dateParam = request.nextUrl.searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json({ error: "Parâmetro 'date' é obrigatório." }, { status: 400 });
  }

  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) {
    return NextResponse.json({ error: "Espaço não encontrado" }, { status: 404 });
  }

  const date = parseDateOnly(dateParam);

  const [sameSpaceBookings, exclusiveBooking] = await Promise.all([
    prisma.booking.findMany({
      where: { spaceId: space.id, date, status: { not: "CANCELLED" } },
      select: { startHour: true, hours: true },
    }),
    prisma.booking.findFirst({
      where: { date, status: { not: "CANCELLED" }, space: { exclusiveVenue: true } },
      select: { startHour: true },
    }),
  ]);

  const bookedRanges = sameSpaceBookings
    .filter((b) => b.startHour != null && b.hours != null)
    .map((b) => [b.startHour as number, (b.startHour as number) + (b.hours as number)]);

  const latestEndHour =
    exclusiveBooking?.startHour != null
      ? exclusiveBooking.startHour - EXCLUSIVE_VENUE_BUFFER_HOURS
      : null;

  return NextResponse.json({ bookedRanges, latestEndHour });
}
