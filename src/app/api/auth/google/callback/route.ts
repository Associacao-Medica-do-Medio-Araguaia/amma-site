import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { googleOAuth } from "@/lib/config";
import { memberSessionCookieValue, MEMBER_SESSION_COOKIE, MEMBER_SESSION_COOKIE_OPTIONS } from "@/lib/memberAuth";

const OAUTH_STATE_COOKIE = "google_oauth_state";

interface GoogleIdTokenPayload {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  aud: string;
}

function decodeIdTokenPayload(idToken: string): GoogleIdTokenPayload {
  const payloadSegment = idToken.split(".")[1];
  const json = Buffer.from(payloadSegment, "base64url").toString("utf8");
  return JSON.parse(json) as GoogleIdTokenPayload;
}

export async function GET(request: NextRequest) {
  const failureUrl = new URL("/associado?erro=google", request.nextUrl.origin);
  if (!googleOAuth.isConfigured) {
    return NextResponse.redirect(failureUrl);
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(failureUrl);
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: googleOAuth.clientId,
      client_secret: googleOAuth.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: googleOAuth.redirectUri,
    }),
  });
  if (!tokenRes.ok) {
    return NextResponse.redirect(failureUrl);
  }

  const { id_token: idToken } = (await tokenRes.json()) as { id_token?: string };
  if (!idToken) {
    return NextResponse.redirect(failureUrl);
  }

  const payload = decodeIdTokenPayload(idToken);
  if (payload.aud !== googleOAuth.clientId || !payload.email_verified) {
    return NextResponse.redirect(failureUrl);
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

  const response = NextResponse.redirect(new URL("/associado", request.nextUrl.origin));
  response.cookies.set(MEMBER_SESSION_COOKIE, memberSessionCookieValue(member.id), MEMBER_SESSION_COOKIE_OPTIONS);
  response.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
