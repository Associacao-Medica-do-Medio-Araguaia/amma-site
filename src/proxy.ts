import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminAuth";
import { session as sessionConfig } from "@/lib/config";

// Verificação leve (sem consulta ao banco) só pra decidir se manda pro login. A página /admin
// continua validando a sessão de verdade (getCurrentAdmin) — isso aqui só evita que o usuário
// deslogado veja a página renderizar (e o footer "pular") antes do redirect acontecer no cliente.
function hasValidAdminSessionCookie(request: NextRequest): boolean {
  const value = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!value) return false;

  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex === -1) return false;
  const adminId = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);

  const expected = Buffer.from(createHmac("sha256", sessionConfig.secret).update(adminId).digest("hex"), "hex");
  const received = Buffer.from(signature, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export default function proxy(request: NextRequest) {
  if (!hasValidAdminSessionCookie(request)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/espacos"],
};
