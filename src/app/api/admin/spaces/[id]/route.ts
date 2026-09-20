import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

interface UpdateSpaceBody {
  description?: string;
  priceCents?: number;
  capacity?: number | null;
  minAdvanceDays?: number;
  monthlyLimitPerMember?: number | null;
  yearlyLimitPerMember?: number | null;
  maxHoursPerBooking?: number | null;
}

function isPositiveIntOrNull(value: unknown): value is number | null {
  return value === null || (Number.isInteger(value) && (value as number) > 0);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as UpdateSpaceBody | null;
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { description, priceCents, capacity, minAdvanceDays, monthlyLimitPerMember, yearlyLimitPerMember, maxHoursPerBooking } = body;

  if (typeof description !== "string" || description.trim().length === 0) {
    return NextResponse.json({ error: "Descrição não pode ficar em branco." }, { status: 400 });
  }
  if (!Number.isInteger(priceCents) || (priceCents as number) <= 0) {
    return NextResponse.json({ error: "Preço inválido." }, { status: 400 });
  }
  if (!Number.isInteger(minAdvanceDays) || (minAdvanceDays as number) < 0) {
    return NextResponse.json({ error: "Antecedência mínima inválida." }, { status: 400 });
  }
  if (!isPositiveIntOrNull(capacity)) {
    return NextResponse.json({ error: "Capacidade inválida." }, { status: 400 });
  }
  if (!isPositiveIntOrNull(monthlyLimitPerMember)) {
    return NextResponse.json({ error: "Limite mensal por associado inválido." }, { status: 400 });
  }
  if (!isPositiveIntOrNull(yearlyLimitPerMember)) {
    return NextResponse.json({ error: "Limite anual por associado inválido." }, { status: 400 });
  }
  if (!isPositiveIntOrNull(maxHoursPerBooking)) {
    return NextResponse.json({ error: "Máximo de horas por reserva inválido." }, { status: 400 });
  }

  const existing = await prisma.space.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Espaço não encontrado." }, { status: 404 });
  }

  const updated = await prisma.space.update({
    where: { id },
    data: {
      description: description.trim(),
      priceCents,
      capacity,
      minAdvanceDays,
      monthlyLimitPerMember,
      yearlyLimitPerMember,
      maxHoursPerBooking,
    },
  });

  return NextResponse.json({ space: updated });
}
