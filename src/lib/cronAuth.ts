import { NextRequest } from "next/server";
import { cron } from "@/lib/config";

// Rotas de cron (lembrete + cancelamento automático) precisam ser chamadas por um agendador
// externo (Vercel Cron, GitHub Actions, etc.) com o header "Authorization: Bearer <CRON_SECRET>".
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const header = request.headers.get("authorization");
  return header === `Bearer ${cron.secret}`;
}
