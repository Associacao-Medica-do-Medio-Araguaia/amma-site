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
    // Quadra de Areia: tem vários horários possíveis por dia, então o dia só fica bloqueado
    // quando NENHUMA janela livre resta — seja porque um evento exclusivo (com o buffer de 4h)
    // não deixa espaço antes dele, seja porque as próprias reservas da quadra já preenchem
    // todo o horário de funcionamento. Conflitos parciais (um horário específico livre) não
    // bloqueiam o dia — são mostrados à parte (ver /day-info) e validados na hora de reservar.
    const openHour = space.operatingStartHour ?? 0;
    const closeHour = space.operatingEndHour ?? 24;

    const [exclusiveBookings, ownBookings] = await Promise.all([
      prisma.booking.findMany({
        where: {
          status: { not: "CANCELLED" },
          date: { gte: rangeStart, lte: rangeEnd },
          space: { exclusiveVenue: true },
        },
        select: { date: true, startHour: true },
      }),
      prisma.booking.findMany({
        where: {
          spaceId: space.id,
          status: { not: "CANCELLED" },
          date: { gte: rangeStart, lte: rangeEnd },
        },
        select: { date: true, startHour: true, hours: true },
      }),
    ]);

    const earliestExclusiveStartByDate = new Map<string, number>();
    for (const b of exclusiveBookings) {
      if (b.startHour == null) continue;
      const key = toDateOnlyString(b.date);
      const current = earliestExclusiveStartByDate.get(key);
      if (current == null || b.startHour < current) earliestExclusiveStartByDate.set(key, b.startHour);
    }

    const ownRangesByDate = new Map<string, [number, number][]>();
    for (const b of ownBookings) {
      if (b.startHour == null || b.hours == null) continue;
      const key = toDateOnlyString(b.date);
      const ranges = ownRangesByDate.get(key) ?? [];
      ranges.push([b.startHour, b.startHour + b.hours]);
      ownRangesByDate.set(key, ranges);
    }

    const candidateDates = new Set([...earliestExclusiveStartByDate.keys(), ...ownRangesByDate.keys()]);
    dbBusyDates = Array.from(candidateDates).filter((dateKey) => {
      const exclusiveStart = earliestExclusiveStartByDate.get(dateKey);
      const effectiveCloseHour =
        exclusiveStart != null ? Math.min(closeHour, exclusiveStart - EXCLUSIVE_VENUE_BUFFER_HOURS) : closeHour;
      if (effectiveCloseHour <= openHour) return true; // sem nenhuma janela livre antes do buffer

      const coveredHours = new Array(effectiveCloseHour - openHour).fill(false);
      for (const [start, end] of ownRangesByDate.get(dateKey) ?? []) {
        for (let h = Math.max(start, openHour); h < Math.min(end, effectiveCloseHour); h++) {
          coveredHours[h - openHour] = true;
        }
      }
      return coveredHours.every(Boolean);
    });
  }

  // O calendário do Google é compartilhado por todos os espaços (mesmo id para todos), então só
  // faz sentido usá-lo para bloqueio de dia inteiro nos espaços exclusivos — para a quadra, um
  // evento de outro espaço nesse calendário não deveria bloquear o dia inteiro dela.
  const calendarBusyDates =
    space.exclusiveVenue && space.googleCalendarId
      ? await getBusyDates(space.googleCalendarId, rangeStart, rangeEnd)
      : [];

  const busyDates = Array.from(new Set([...dbBusyDates, ...calendarBusyDates])).sort();

  return NextResponse.json({ busyDates });
}
