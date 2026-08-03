// Datas de reserva representam apenas um "dia calendário" (sem hora/timezone relevante).
// Por isso todas as operações aqui usam os métodos UTC do Date, para não sofrer variação
// por causa do fuso horário do servidor onde o app estiver rodando.

export function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addDaysUTC(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Converte uma string "yyyy-mm-dd" (vinda do calendário) em Date à meia-noite UTC. */
export function parseDateOnly(value: string): Date {
  return startOfDayUTC(new Date(`${value}T00:00:00Z`));
}

/** Primeira data em que uma nova reserva pode ser feita (hoje + antecedência mínima do espaço). */
export function earliestBookableDate(minAdvanceDays: number, now: Date = new Date()): Date {
  return startOfDayUTC(addDaysUTC(now, minAdvanceDays));
}

/** Data-limite para o saldo (SPLIT) ou pagamento único (FULL), conforme o prazo do espaço. */
export function finalPaymentDueDate(bookingDate: Date, finalDueDays: number): Date {
  return startOfDayUTC(addDaysUTC(bookingDate, -finalDueDays));
}

export function formatDatePtBR(date: Date): string {
  return startOfDayUTC(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
