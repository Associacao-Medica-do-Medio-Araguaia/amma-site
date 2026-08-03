import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  memberSessionCookieValue,
  MEMBER_SESSION_COOKIE,
  MEMBER_SESSION_COOKIE_OPTIONS,
} from "@/lib/memberAuth";

interface RegisterBody {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Partial<RegisterBody>;

  if (
    !body.name?.trim() ||
    !body.email?.trim() ||
    !body.cpf?.trim() ||
    !body.phone?.trim() ||
    !body.password ||
    body.password.length < 6
  ) {
    return NextResponse.json(
      { error: "Preencha nome, e-mail, CPF, telefone e uma senha de pelo menos 6 caracteres." },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();
  const cpf = body.cpf.replace(/\D/g, "");

  const existing = await prisma.member.findFirst({ where: { OR: [{ email }, { cpf }] } });
  if (existing) {
    return NextResponse.json(
      { error: existing.email === email ? "Já existe uma conta com esse e-mail." : "Já existe uma conta com esse CPF." },
      { status: 409 },
    );
  }

  const member = await prisma.member.create({
    data: {
      name: body.name.trim(),
      email,
      cpf,
      phone: body.phone.trim(),
      passwordHash: hashPassword(body.password),
    },
  });

  const response = NextResponse.json({ member: { id: member.id, name: member.name } });
  response.cookies.set(MEMBER_SESSION_COOKIE, memberSessionCookieValue(member.id), MEMBER_SESSION_COOKIE_OPTIONS);
  return response;
}
