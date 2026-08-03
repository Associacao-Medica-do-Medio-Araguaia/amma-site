import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { googleOAuth } from "@/lib/config";

const OAUTH_STATE_COOKIE = "google_oauth_state";

// Início do login com Google: redireciona pro consent screen. Ver o callback em
// src/app/api/auth/google/callback/route.ts.
export async function GET() {
  if (!googleOAuth.isConfigured) {
    return NextResponse.json({ error: "Login com Google não está configurado." }, { status: 404 });
  }

  const state = randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: googleOAuth.clientId,
    redirect_uri: googleOAuth.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
