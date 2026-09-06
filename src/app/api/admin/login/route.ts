import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_COOKIE_OPTIONS, adminSessionCookieValue, verifyAdminCredentials } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Preencha e-mail e senha." }, { status: 400 });
  }

  const admin = await verifyAdminCredentials(email, password);
  if (!admin) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, adminSessionCookieValue(admin.id), ADMIN_SESSION_COOKIE_OPTIONS);
  return response;
}
