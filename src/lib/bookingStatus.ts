export const BOOKING_STATUS_LABEL: Record<
  "AWAITING_DEPOSIT" | "AWAITING_FINAL_PAYMENT" | "CONFIRMED" | "CANCELLED",
  string
> = {
  AWAITING_DEPOSIT: "Aguardando pagamento",
  AWAITING_FINAL_PAYMENT: "Aguardando restante (70%)",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};
