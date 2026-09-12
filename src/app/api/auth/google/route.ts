import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { googleOAuth } from "@/lib/config";
import { memberSessionCookieValue, MEMBER_SESSION_COOKIE, MEMBER_SESSION_COOKIE_OPTIONS } from "@/lib/memberAuth";

const client = new OAuth2Client(googleOAuth.clientId);

// Recebe o ID token entregue pelo botão padrão do Google (Google Identity Services) e
// verifica a assinatura junto ao Google antes de confiar no conteúdo — diferente de uma
// troca de código servidor-a-servidor, esse token vem do navegador do usuário.
export async function POST(request: NextRequest) {
  if (!googleOAuth.isConfigured) {
    return NextResponse.json({ error: "Login com Google não está configurado." }, { status: 404 });
  }

  const { credential } = (await request.json().catch(() => ({}))) as { credential?: string };
  if (!credential) {
    return NextResponse.json({ error: "Credencial ausente." }, { status: 400 });
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: googleOAuth.clientId });
    payload = ticket.getPayload();
  } catch {
    return NextResponse.json({ error: "Credencial inválida." }, { status: 401 });
  }

  if (!payload?.email || !payload.email_verified) {
    return NextResponse.json({ error: "E-mail do Google não verificado." }, { status: 401 });
  }

  const email = payload.email.toLowerCase();
  let member = await prisma.member.findUnique({ where: { googleId: payload.sub } });
  if (!member) {
    member = await prisma.member.findUnique({ where: { email } });
    if (member) {
      member = await prisma.member.update({ where: { id: member.id }, data: { googleId: payload.sub } });
    } else {
      member = await prisma.member.create({
        data: { name: payload.name ?? email, email, googleId: payload.sub },
      });
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(MEMBER_SESSION_COOKIE, memberSessionCookieValue(member.id), MEMBER_SESSION_COOKIE_OPTIONS);
  return response;
}
