import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  memberSessionCookieValue,
  MEMBER_SESSION_COOKIE,
  MEMBER_SESSION_COOKIE_OPTIONS,
} from "@/lib/memberAuth";
import { verifyCrm, BRAZIL_UF_CODES } from "@/lib/crm";

interface RegisterBody {
  name: string;
  email: string;
  crm: string;
  crmUf: string;
  phone: string;
  password: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Partial<RegisterBody>;

  if (
    !body.name?.trim() ||
    !body.email?.trim() ||
    !body.crm?.trim() ||
    !body.crmUf?.trim() ||
    !body.phone?.trim() ||
    !body.password ||
    body.password.length < 6
  ) {
    return NextResponse.json(
      { error: "Preencha nome, e-mail, CRM, UF, telefone e uma senha de pelo menos 6 caracteres." },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();
  const crm = body.crm.replace(/\D/g, "");
  const crmUf = body.crmUf.trim().toUpperCase();

  if (!crm || !(BRAZIL_UF_CODES as readonly string[]).includes(crmUf)) {
    return NextResponse.json({ error: "Informe um número de CRM e uma UF válidos." }, { status: 400 });
  }

  const existing = await prisma.member.findFirst({ where: { OR: [{ email }, { crm, crmUf }] } });
  if (existing) {
    return NextResponse.json(
      { error: existing.email === email ? "Já existe uma conta com esse e-mail." : "Já existe uma conta com esse CRM." },
      { status: 409 },
    );
  }

  const verification = await verifyCrm(crm, crmUf);
  if (verification.outcome === "not_found") {
    return NextResponse.json(
      { error: `CRM ${crm}/${crmUf} não encontrado. Confira o número e o estado.` },
      { status: 422 },
    );
  }
  if (verification.outcome === "inactive") {
    return NextResponse.json(
      { error: `Esse CRM consta como "${verification.situacao}" em ${crmUf}, não ativo — cadastro não permitido.` },
      { status: 422 },
    );
  }

  const member = await prisma.member.create({
    data: {
      name: body.name.trim(),
      email,
      crm,
      crmUf,
      phone: body.phone.trim(),
      passwordHash: hashPassword(body.password),
      ...(verification.outcome === "verified"
        ? { crmVerifiedName: verification.name, crmVerifiedAt: new Date() }
        : {}),
    },
  });

  const response = NextResponse.json({ member: { id: member.id, name: member.name } });
  response.cookies.set(MEMBER_SESSION_COOKIE, memberSessionCookieValue(member.id), MEMBER_SESSION_COOKIE_OPTIONS);
  return response;
}
