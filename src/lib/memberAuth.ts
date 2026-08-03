import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { session as sessionConfig } from "@/lib/config";
import type { MemberModel as Member } from "@/generated/prisma/models";

export const MEMBER_SESSION_COOKIE = "member_session";

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function signMemberId(memberId: string): string {
  return createHmac("sha256", sessionConfig.secret).update(memberId).digest("hex");
}

/** Valor pronto para gravar no cookie de sessão — usado pelas rotas de login/cadastro/OAuth. */
export function memberSessionCookieValue(memberId: string): string {
  return `${memberId}.${signMemberId(memberId)}`;
}

export const MEMBER_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 dias
};

export async function getCurrentMember(): Promise<Member | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;
  if (!value) return null;

  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex === -1) return null;
  const memberId = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);

  const expected = Buffer.from(signMemberId(memberId), "hex");
  const received = Buffer.from(signature, "hex");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }

  return prisma.member.findUnique({ where: { id: memberId } });
}
