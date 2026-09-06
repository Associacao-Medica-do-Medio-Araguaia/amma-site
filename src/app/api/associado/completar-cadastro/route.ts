import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMember } from "@/lib/memberAuth";
import { verifyCrm, BRAZIL_UF_CODES } from "@/lib/crm";

export async function POST(request: NextRequest) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { crm, crmUf, phone } = (await request.json().catch(() => ({}))) as {
    crm?: string;
    crmUf?: string;
    phone?: string;
  };
  if (!crm?.trim() || !crmUf?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Informe CRM, UF e telefone." }, { status: 400 });
  }

  const normalizedCrm = crm.replace(/\D/g, "");
  const normalizedUf = crmUf.trim().toUpperCase();
  if (!normalizedCrm || !(BRAZIL_UF_CODES as readonly string[]).includes(normalizedUf)) {
    return NextResponse.json({ error: "Informe um número de CRM e uma UF válidos." }, { status: 400 });
  }

  const existing = await prisma.member.findUnique({
    where: { crm_crmUf: { crm: normalizedCrm, crmUf: normalizedUf } },
  });
  if (existing && existing.id !== member.id) {
    return NextResponse.json({ error: "Já existe uma conta com esse CRM." }, { status: 409 });
  }

  const verification = await verifyCrm(normalizedCrm, normalizedUf);
  if (verification.outcome === "not_found") {
    return NextResponse.json(
      { error: `CRM ${normalizedCrm}/${normalizedUf} não encontrado. Confira o número e o estado.` },
      { status: 422 },
    );
  }
  if (verification.outcome === "inactive") {
    return NextResponse.json(
      { error: `Esse CRM consta como "${verification.situacao}" em ${normalizedUf}, não ativo — cadastro não permitido.` },
      { status: 422 },
    );
  }

  const updated = await prisma.member.update({
    where: { id: member.id },
    data: {
      crm: normalizedCrm,
      crmUf: normalizedUf,
      phone: phone.trim(),
      ...(verification.outcome === "verified"
        ? { crmVerifiedName: verification.name, crmVerifiedAt: new Date() }
        : {}),
    },
  });

  return NextResponse.json({ member: { id: updated.id, name: updated.name } });
}
