import { NextResponse } from "next/server";
import { MEMBER_SESSION_COOKIE } from "@/lib/memberAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(MEMBER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
