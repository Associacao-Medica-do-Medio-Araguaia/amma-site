import { CheckCircle2, Clock, XCircle, type LucideIcon } from "lucide-react";

export const BOOKING_STATUS_LABEL: Record<
  "AWAITING_DEPOSIT" | "AWAITING_FINAL_PAYMENT" | "CONFIRMED" | "CANCELLED",
  string
> = {
  AWAITING_DEPOSIT: "Aguardando pagamento",
  AWAITING_FINAL_PAYMENT: "Aguardando restante (70%)",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};

export const BOOKING_STATUS_ICON: Record<
  "AWAITING_DEPOSIT" | "AWAITING_FINAL_PAYMENT" | "CONFIRMED" | "CANCELLED",
  LucideIcon
> = {
  AWAITING_DEPOSIT: Clock,
  AWAITING_FINAL_PAYMENT: Clock,
  CONFIRMED: CheckCircle2,
  CANCELLED: XCircle,
};

export const BOOKING_STATUS_COLOR: Record<
  "AWAITING_DEPOSIT" | "AWAITING_FINAL_PAYMENT" | "CONFIRMED" | "CANCELLED",
  string
> = {
  AWAITING_DEPOSIT: "text-amber-600",
  AWAITING_FINAL_PAYMENT: "text-amber-600",
  CONFIRMED: "text-green-600",
  CANCELLED: "text-red-600",
};
