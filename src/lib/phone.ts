/** Normaliza um telefone digitado por um usuário brasileiro para o formato E.164 (sem "+"). */
export function toWhatsappE164(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}
