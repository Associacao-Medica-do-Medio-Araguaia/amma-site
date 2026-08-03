import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { admin as adminConfig } from "@/lib/config";

// Autenticação de admin bem simples (senha única, sem usuários) — suficiente para o cliente
// operar o painel sozinho. TODO(você): antes de produção, avaliar algo mais robusto
// (ex. NextAuth com múltiplos usuários) se mais de uma pessoa for operar o painel.

export const ADMIN_SESSION_COOKIE = "admin_session";

function sessionToken(): string {
  return createHash("sha256").update(adminConfig.password).digest("hex");
}

export function isValidAdminPassword(password: string): boolean {
  return password === adminConfig.password;
}

export function getAdminSessionCookieValue(): string {
  return sessionToken();
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === sessionToken();
}
