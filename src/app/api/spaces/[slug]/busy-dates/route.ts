import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusyDates } from "@/lib/googleCalendar";
import { addDaysUTC, toDateOnlyString } from "@/lib/dates";
import { EXCLUSIVE_VENUE_BUFFER_HOURS } from "@/lib/spaceRules";

// Datas ocupadas = reservas ativas no nosso banco + bloqueios feitos direto no Google Agenda
// (ex. manutenção do espaço marcada manualmente pelo cliente).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) {
    return NextResponse.json({ error: "Espaço não encontrado" }, { status: 404 });
  }

  const rangeStart = new Date();
  const rangeEnd = addDaysUTC(rangeStart, 180);

  let dbBusyDates: string[];

  if (space.exclusiveVenue) {
    // Salão de Festa, Área Externa e Cozinha Gourmet disputam o mesmo dia entre si — qualquer
    // reserva ativa em um deles bloqueia o dia para os outros também.
    const bookings = await prisma.booking.findMany({
      where: {
        status: { not: "CANCELLED" },
        date: { gte: rangeStart, lte: rangeEnd },
        space: { exclusiveVenue: true },
      },
      select: { date: true },
    });
    dbBusyDates = bookings.map((b) => toDateOnlyString(b.date));
  } else {
    // Quadra de Areia: o dia só fica totalmente bloqueado se um evento exclusivo não deixar
    // nenhuma janela de horário livre antes dele (considerando o buffer de 4h e o horário de
    // funcionamento). Conflitos parciais (horário específico) são validados na hora de reservar.
    const exclusiveBookings = await prisma.booking.findMany({
      where: {
        status: { not: "CANCELLED" },
        date: { gte: rangeStart, lte: rangeEnd },
        space: { exclusiveVenue: true },
      },
      select: { date: true, startHour: true },
    });
    const openHour = space.operatingStartHour ?? 0;
    dbBusyDates = exclusiveBookings
      .filter((b) => b.startHour != null && b.startHour - EXCLUSIVE_VENUE_BUFFER_HOURS <= openHour)
      .map((b) => toDateOnlyString(b.date));
  }

  const calendarBusyDates = space.googleCalendarId
    ? await getBusyDates(space.googleCalendarId, rangeStart, rangeEnd)
    : [];

  const busyDates = Array.from(new Set([...dbBusyDates, ...calendarBusyDates])).sort();

  return NextResponse.json({ busyDates });
}
