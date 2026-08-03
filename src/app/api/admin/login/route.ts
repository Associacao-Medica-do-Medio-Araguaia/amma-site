import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSessionCookieValue, isValidAdminPassword } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const { password } = (await request.json()) as { password?: string };

  if (!password || !isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, getAdminSessionCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h
  });
  return response;
}
