import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { session as sessionConfig } from "@/lib/config";
import { verifyPassword } from "@/lib/memberAuth";
import type { AdminModel as Admin } from "@/generated/prisma/models";

export const ADMIN_SESSION_COOKIE = "admin_session";

export const ADMIN_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 12, // 12h
};

function signAdminId(adminId: string): string {
  return createHmac("sha256", sessionConfig.secret).update(adminId).digest("hex");
}

/** Valor pronto para gravar no cookie de sessão — usado pela rota de login. */
export function adminSessionCookieValue(adminId: string): string {
  return `${adminId}.${signAdminId(adminId)}`;
}

/** Confirma email + senha contra a tabela Admin; retorna o admin autenticado ou null. */
export async function verifyAdminCredentials(email: string, password: string): Promise<Admin | null> {
  let admin: Admin | null;
  try {
    admin = await prisma.admin.findUnique({ where: { email } });
  } catch (error) {
    // Cobre o período de transição antes da migration "add_admin" ser aplicada em produção
    // (ver .env.example) — sem isso, um erro de banco vira uma tela de erro 500 no login.
    console.error("[adminAuth] falha ao consultar Admin (migration aplicada?):", error);
    return null;
  }
  if (!admin) return null;
  return verifyPassword(password, admin.passwordHash) ? admin : null;
}

export async function getCurrentAdmin(): Promise<Admin | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!value) return null;

  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex === -1) return null;
  const adminId = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);

  const expected = Buffer.from(signAdminId(adminId), "hex");
  const received = Buffer.from(signature, "hex");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    return await prisma.admin.findUnique({ where: { id: adminId } });
  } catch (error) {
    console.error("[adminAuth] falha ao consultar Admin (migration aplicada?):", error);
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getCurrentAdmin()) !== null;
}
