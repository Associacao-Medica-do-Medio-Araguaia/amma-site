import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMember } from "@/lib/memberAuth";

export async function POST(request: NextRequest) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { cpf, phone } = (await request.json().catch(() => ({}))) as { cpf?: string; phone?: string };
  if (!cpf?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Informe CPF e telefone." }, { status: 400 });
  }

  const normalizedCpf = cpf.replace(/\D/g, "");
  const existing = await prisma.member.findUnique({ where: { cpf: normalizedCpf } });
  if (existing && existing.id !== member.id) {
    return NextResponse.json({ error: "Já existe uma conta com esse CPF." }, { status: 409 });
  }

  const updated = await prisma.member.update({
    where: { id: member.id },
    data: { cpf: normalizedCpf, phone: phone.trim() },
  });

  return NextResponse.json({ member: { id: updated.id, name: updated.name } });
}
