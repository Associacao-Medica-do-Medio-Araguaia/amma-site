import { pix as pixConfig, site as siteConfig } from "@/lib/config";

// O "copia e cola" oficial (com CRC conferido) vem de PIX_STATIC_PAYLOAD — ver src/lib/config.ts.
// O gerador abaixo só entra como reserva, caso esse valor não esteja configurado.
// Referência: manual de padrões para iniciação do Pix (Banco Central do Brasil).

function tlv(id: string, value: string): string {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

// Remove acentos e caracteres fora do conjunto permitido pelo padrão EMV (ASCII simples).
function sanitize(value: string, maxLength: number): string {
  return value
    .normalize("NFD")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, maxLength);
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Monta um Pix estático (sem valor fixo) a partir da chave/nome/cidade — usado só como reserva. */
function buildPixPayloadFromParts(): string {
  const merchantAccountInfo = tlv("00", "br.gov.bcb.pix") + tlv("01", pixConfig.key);

  const fields =
    tlv("00", "01") + // Payload Format Indicator
    tlv("01", "11") + // Point of Initiation Method: 11 = estático/reutilizável
    tlv("26", merchantAccountInfo) + // Merchant Account Information - Pix
    tlv("52", "0000") + // Merchant Category Code
    tlv("53", "986") + // Moeda: BRL
    // Sem "54" (Transaction Amount) de propósito: valor é informado manualmente pelo pagador.
    tlv("58", "BR") +
    tlv("59", sanitize(pixConfig.merchantName, 25)) +
    tlv("60", sanitize(pixConfig.merchantCity, 15)) +
    tlv("62", tlv("05", "***"));

  const payloadWithCrcPlaceholder = `${fields}6304`;
  const crc = crc16(payloadWithCrcPlaceholder);
  return `${payloadWithCrcPlaceholder}${crc}`;
}

export function buildStaticPixPayload(): string {
  return pixConfig.staticPayload || buildPixPayloadFromParts();
}

/**
 * URL pública do PNG do QR Code do Pix estático — usada no e-mail de lembrete (exige URL, não
 * data URI). Prioriza SITE_URL (config), já que o e-mail é aberto em outra rede/dispositivo:
 * usar o origin da requisição (localhost/IP da rede local em dev) resultaria numa imagem que o
 * Gmail/Outlook não conseguem carregar.
 */
export function buildPixQrCodeImageUrl(requestOrigin: string): string {
  return new URL("/api/pix-qrcode.png", siteConfig.url || requestOrigin).toString();
}

/** Página que copia o código Pix para a área de transferência com um clique — usada como botão nos e-mails. */
export function buildPixCopyPageUrl(requestOrigin: string, pixCopyPaste: string, amountFormatted?: string): string {
  const url = new URL("/pix/copiar", siteConfig.url || requestOrigin);
  url.searchParams.set("codigo", pixCopyPaste);
  if (amountFormatted) url.searchParams.set("valor", amountFormatted);
  return url.toString();
}
