import { crmVerification } from "@/lib/config";

export const BRAZIL_UF_CODES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

interface ConsultaCrmItem {
  nome: string;
  numero: string;
  uf: string;
  situacao: string;
}

interface ConsultaCrmResponse {
  status: string;
  total: number;
  item: ConsultaCrmItem[];
}

export type CrmVerificationResult =
  | { outcome: "verified"; name: string }
  | { outcome: "not_found" }
  | { outcome: "inactive"; situacao: string }
  | { outcome: "unavailable" }; // erro/timeout da API — não é o mesmo que "CRM inválido"

/**
 * Confirma um CRM contra a API do consultacrm.com.br (tipo=CRM). Retorna "unavailable" (não
 * "not_found") em qualquer falha de rede/API — nesse caso o cadastro deve ser aceito mesmo assim
 * e marcado pra conferência manual do admin, pra não bloquear um médico de verdade por uma
 * instabilidade de terceiro.
 */
export async function verifyCrm(crmNumber: string, uf: string): Promise<CrmVerificationResult> {
  if (!crmVerification.isConfigured) return { outcome: "unavailable" };

  const url = new URL("https://www.consultacrm.com.br/api/index.php");
  url.searchParams.set("tipo", "CRM");
  url.searchParams.set("q", crmNumber);
  url.searchParams.set("uf", uf);
  url.searchParams.set("chave", crmVerification.apiKey);
  url.searchParams.set("destino", "json");

  let data: ConsultaCrmResponse;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.error("[crm] falha ao consultar consultacrm.com.br:", error);
    return { outcome: "unavailable" };
  }

  const exactMatch = data.item?.find((item) => item.numero === crmNumber && item.uf === uf);
  if (!exactMatch) return { outcome: "not_found" };
  if (exactMatch.situacao !== "Ativo") return { outcome: "inactive", situacao: exactMatch.situacao };
  return { outcome: "verified", name: exactMatch.nome };
}
