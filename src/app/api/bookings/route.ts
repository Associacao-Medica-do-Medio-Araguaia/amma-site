import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { business } from "@/lib/config";
import { earliestBookableDate, finalPaymentDueDate, formatDatePtBR, parseDateOnly } from "@/lib/dates";
import { parseShiftOptions, EXCLUSIVE_VENUE_BUFFER_HOURS } from "@/lib/spaceRules";
import { getCurrentMember } from "@/lib/memberAuth";
import { sendEmail, bookingReceivedEmailHtml } from "@/lib/email";
import { buildStaticPixPayload, buildPixCopyPageUrl, buildPixQrCodeImageUrl } from "@/lib/pix";
import { formatCentsToBRL } from "@/lib/money";

interface CreateBookingBody {
  spaceSlug: string;
  date: string; // "yyyy-mm-dd"
  shiftLabel?: string; // obrigatório para espaços com shiftOptions
  hours?: number; // obrigatório para espaços HOURLY sem turno fixo (ex. quadra)
  startHour?: number; // obrigatório para espaços HOURLY sem turno fixo (ex. quadra)
}

export async function POST(request: NextRequest) {
  const member = await getCurrentMember();
  if (!member || !member.crm || !member.phone) {
    return NextResponse.json(
      { error: "Você precisa estar logado, com CRM e telefone cadastrados, para reservar." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as Partial<CreateBookingBody>;

  if (!body.spaceSlug || !body.date) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  const space = await prisma.space.findUnique({ where: { slug: body.spaceSlug } });
  if (!space) {
    return NextResponse.json({ error: "Espaço não encontrado." }, { status: 404 });
  }

  const date = parseDateOnly(body.date);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Data inválida." }, { status: 400 });
  }

  if (date < earliestBookableDate(space.minAdvanceDays)) {
    return NextResponse.json(
      {
        error: `A reserva deste espaço precisa ser feita com pelo menos ${space.minAdvanceDays} dias de antecedência.`,
      },
      { status: 400 },
    );
  }

  // Determina turno/horário e duração conforme o tipo do espaço.
  let shiftLabel: string | null = null;
  let startHour: number;
  let hours: number;

  const shiftOptions = parseShiftOptions(space.shiftOptions);
  if (shiftOptions.length > 0) {
    const chosen = shiftOptions.find((opt) => opt.label === body.shiftLabel);
    if (!chosen) {
      return NextResponse.json({ error: "Escolha um turno válido." }, { status: 400 });
    }
    shiftLabel = chosen.label;
    startHour = chosen.startHour;
    hours = chosen.durationHours;
  } else if (space.pricingUnit === "HOURLY") {
    if (!body.hours || !Number.isInteger(body.hours) || body.hours < 1) {
      return NextResponse.json({ error: "Escolha a duração desejada." }, { status: 400 });
    }
    if (space.maxHoursPerBooking && body.hours > space.maxHoursPerBooking) {
      return NextResponse.json(
        { error: `Duração máxima de ${space.maxHoursPerBooking}h por reserva.` },
        { status: 400 },
      );
    }
    if (typeof body.startHour !== "number" || !Number.isInteger(body.startHour)) {
      return NextResponse.json({ error: "Escolha o horário de início." }, { status: 400 });
    }
    const openHour = space.operatingStartHour ?? 0;
    const closeHour = space.operatingEndHour ?? 24;
    if (body.startHour < openHour || body.startHour + body.hours > closeHour) {
      return NextResponse.json(
        { error: `Horário precisa estar entre ${openHour}h e ${closeHour}h.` },
        { status: 400 },
      );
    }
    startHour = body.startHour;
    hours = body.hours;
  } else {
    return NextResponse.json({ error: "Configuração de espaço inválida." }, { status: 500 });
  }

  // Checagens abaixo não são atômicas; com o baixo volume de reservas simultâneas esperado
  // isso é suficiente. Se o volume crescer, vale mover para uma constraint/transação de banco.

  if (space.exclusiveVenue) {
    // Salão de Festa, Área Externa e Cozinha Gourmet disputam o mesmo dia entre si.
    const conflict = await prisma.booking.findFirst({
      where: {
        date,
        status: { not: "CANCELLED" },
        space: { exclusiveVenue: true },
      },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Já existe um evento reservado (Salão, Área Externa ou Cozinha) nessa data." },
        { status: 409 },
      );
    }
  } else {
    // Quadra de Areia: pode coexistir com um espaço exclusivo no mesmo dia, desde que termine
    // pelo menos 4h antes do início do outro evento.
    const sameDayExclusive = await prisma.booking.findFirst({
      where: { date, status: { not: "CANCELLED" }, space: { exclusiveVenue: true } },
    });
    if (sameDayExclusive && sameDayExclusive.startHour != null) {
      const quadraEnd = startHour + hours;
      if (quadraEnd > sameDayExclusive.startHour - EXCLUSIVE_VENUE_BUFFER_HOURS) {
        return NextResponse.json(
          {
            error: `Nessa data já há um evento reservado — a quadra só pode ser usada até ${
              sameDayExclusive.startHour - EXCLUSIVE_VENUE_BUFFER_HOURS
            }h.`,
          },
          { status: 409 },
        );
      }
    }
  }

  if (space.exclusiveVenue) {
    // Já coberto pela checagem de exclusividade acima (bloqueia o dia inteiro entre espaços
    // exclusivos, incluindo o próprio espaço).
  } else {
    // Quadra de Areia permite vários horários no mesmo dia — só bloqueia se o intervalo
    // escolhido sobrepõe outra reserva já feita na mesma data.
    const sameDayBookings = await prisma.booking.findMany({
      where: { spaceId: space.id, date, status: { not: "CANCELLED" } },
    });
    const requestedEnd = startHour + hours;
    const overlaps = sameDayBookings.some((existing) => {
      if (existing.startHour == null || existing.hours == null) return false;
      const existingEnd = existing.startHour + existing.hours;
      return startHour < existingEnd && requestedEnd > existing.startHour;
    });
    if (overlaps) {
      return NextResponse.json(
        { error: "Esse horário já está reservado. Escolha outro horário." },
        { status: 409 },
      );
    }
  }

  if (space.monthlyLimitPerMember != null || space.yearlyLimitPerMember != null) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();

    if (space.monthlyLimitPerMember != null) {
      const monthStart = new Date(Date.UTC(year, month, 1));
      const monthEnd = new Date(Date.UTC(year, month + 1, 1));
      const countThisMonth = await prisma.booking.count({
        where: {
          spaceId: space.id,
          memberId: member.id,
          status: { not: "CANCELLED" },
          date: { gte: monthStart, lt: monthEnd },
        },
      });
      if (countThisMonth >= space.monthlyLimitPerMember) {
        return NextResponse.json(
          { error: `Limite de ${space.monthlyLimitPerMember} reserva(s) por mês para este espaço já atingido.` },
          { status: 409 },
        );
      }
    }

    if (space.yearlyLimitPerMember != null) {
      const yearStart = new Date(Date.UTC(year, 0, 1));
      const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
      const countThisYear = await prisma.booking.count({
        where: {
          spaceId: space.id,
          memberId: member.id,
          status: { not: "CANCELLED" },
          date: { gte: yearStart, lt: yearEnd },
        },
      });
      if (countThisYear >= space.yearlyLimitPerMember) {
        return NextResponse.json(
          { error: `Limite de ${space.yearlyLimitPerMember} reserva(s) por ano para este espaço já atingido.` },
          { status: 409 },
        );
      }
    }
  }

  const totalCents = space.pricingUnit === "HOURLY" ? space.priceCents * hours : space.priceCents;
  const isFullPayment = space.paymentType === "FULL";
  const depositCents = isFullPayment
    ? totalCents
    : Math.round(totalCents * business.depositPercentage);
  const finalCents = isFullPayment ? 0 : totalCents - depositCents;

  const booking = await prisma.booking.create({
    data: {
      spaceId: space.id,
      memberId: member.id,
      date,
      shiftLabel,
      startHour,
      hours,
      totalCents,
      depositCents,
      finalCents,
      finalDueDate: finalPaymentDueDate(date, space.finalDueDays),
    },
  });

  try {
    const pixCopyPaste = buildStaticPixPayload();
    const amountDueFormatted = formatCentsToBRL(depositCents);
    await sendEmail({
      to: member.email,
      subject: "✅ Recebemos sua reserva",
      html: bookingReceivedEmailHtml({
        customerName: member.name,
        spaceName: space.name,
        date: formatDatePtBR(booking.date),
        amountDueFormatted,
        pixCopyPaste,
        qrCodeImageUrl: buildPixQrCodeImageUrl(request.nextUrl.origin),
        copyUrl: buildPixCopyPageUrl(request.nextUrl.origin, pixCopyPaste, amountDueFormatted),
        bookingId: booking.id,
      }),
    });
  } catch (error) {
    console.error("[bookings] falha ao enviar e-mail de reserva recebida:", error);
  }

  return NextResponse.json({ bookingId: booking.id }, { status: 201 });
}
