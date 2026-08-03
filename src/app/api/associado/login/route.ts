import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  memberSessionCookieValue,
  MEMBER_SESSION_COOKIE,
  MEMBER_SESSION_COOKIE_OPTIONS,
} from "@/lib/memberAuth";

export async function POST(request: NextRequest) {
  const { cpf, password } = (await request.json().catch(() => ({}))) as {
    cpf?: string;
    password?: string;
  };

  if (!cpf?.trim() || !password) {
    return NextResponse.json({ error: "Informe CPF e senha." }, { status: 400 });
  }

  const member = await prisma.member.findUnique({ where: { cpf: cpf.replace(/\D/g, "") } });
  if (!member) {
    return NextResponse.json({ error: "CPF ou senha incorretos." }, { status: 401 });
  }
  if (!member.passwordHash) {
    return NextResponse.json(
      { error: "Esta conta usa login com Google. Entre com o Google." },
      { status: 401 },
    );
  }
  if (!verifyPassword(password, member.passwordHash)) {
    return NextResponse.json({ error: "CPF ou senha incorretos." }, { status: 401 });
  }

  const response = NextResponse.json({ member: { id: member.id, name: member.name } });
  response.cookies.set(MEMBER_SESSION_COOKIE, memberSessionCookieValue(member.id), MEMBER_SESSION_COOKIE_OPTIONS);
  return response;
}
