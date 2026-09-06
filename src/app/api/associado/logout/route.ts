import { NextRequest, NextResponse } from "next/server";
import { MEMBER_SESSION_COOKIE } from "@/lib/memberAuth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.set(MEMBER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
