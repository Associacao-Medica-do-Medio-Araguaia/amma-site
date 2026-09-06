"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCentsToBRL } from "@/lib/money";
import { formatDatePtBR } from "@/lib/dates";
import { BOOKING_STATUS_LABEL } from "@/lib/bookingStatus";

export interface AdminBookingRow {
  id: string;
  spaceName: string;
  date: string; // ISO
  status: "AWAITING_DEPOSIT" | "AWAITING_FINAL_PAYMENT" | "CONFIRMED" | "CANCELLED";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCrm: string;
  customerCrmVerified: boolean;
  customerCrmVerifiedName: string;
  shiftLabel: string | null;
  startHour: number | null;
  hours: number | null;
  depositCents: number;
  finalCents: number;
  finalDueDate: string; // ISO
  cancelledReason: string | null;
}

function formatSchedule(row: AdminBookingRow): string | null {
  if (row.shiftLabel) return row.shiftLabel;
  if (row.startHour != null && row.hours != null) return `${row.startHour}h às ${row.startHour + row.hours}h`;
  return null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="break-words">{children}</div>
    </div>
  );
}

export default function AdminBookingsTable({ bookings }: { bookings: AdminBookingRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function callAction(
    bookingId: string,
    action: "confirm-deposit" | "confirm-final" | "cancel",
    body?: Record<string, unknown>,
  ) {
    setBusyId(bookingId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/${action}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Falha ao atualizar a reserva.");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-col gap-4">
        {bookings.map((booking) => {
          const schedule = formatSchedule(booking);
          return (
            <div key={booking.id} className="rounded-lg border border-border p-4 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
                <Field label="Data">
                  {formatDatePtBR(new Date(booking.date))}
                  {schedule && <div className="text-xs text-muted-foreground">{schedule}</div>}
                </Field>
                <Field label="Espaço">{booking.spaceName}</Field>
                <Field label="Cliente">
                  {booking.customerName}
                  <div className="text-xs text-muted-foreground">
                    CRM: {booking.customerCrm}
                    {booking.customerCrm && !booking.customerCrmVerified && (
                      <span className="ml-1 text-amber-600">(não verificado — conferir manualmente)</span>
                    )}
                  </div>
                  {booking.customerCrmVerified && (
                    <div className="text-xs text-muted-foreground">
                      Consta como: {booking.customerCrmVerifiedName}
                      {booking.customerCrmVerifiedName.toLowerCase() !== booking.customerName.toLowerCase() && (
                        <span className="ml-1 text-amber-600">(nome diferente do cadastro — conferir)</span>
                      )}
                    </div>
                  )}
                </Field>
                <Field label="Contato">
                  <div>{booking.customerEmail}</div>
                  <div>{booking.customerPhone}</div>
                </Field>
                <Field label="Status">
                  {BOOKING_STATUS_LABEL[booking.status]}
                  {booking.status === "CANCELLED" && booking.cancelledReason && (
                    <div className="text-xs text-muted-foreground">{booking.cancelledReason}</div>
                  )}
                  {booking.status === "AWAITING_FINAL_PAYMENT" && (
                    <div className="text-xs text-muted-foreground">
                      vence {formatDatePtBR(new Date(booking.finalDueDate))}
                    </div>
                  )}
                  {booking.status === "AWAITING_DEPOSIT" && booking.finalCents === 0 && (
                    <div className="text-xs text-muted-foreground">
                      pagamento único, vence {formatDatePtBR(new Date(booking.finalDueDate))}
                    </div>
                  )}
                </Field>
                <Field label="Sinal">{formatCentsToBRL(booking.depositCents)}</Field>
                <Field label="Restante">{formatCentsToBRL(booking.finalCents)}</Field>
              </div>

              {(booking.status === "AWAITING_DEPOSIT" || booking.status === "AWAITING_FINAL_PAYMENT") && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-3">
                  {booking.status === "AWAITING_DEPOSIT" && (
                    <button
                      disabled={busyId === booking.id}
                      onClick={() => callAction(booking.id, "confirm-deposit")}
                      className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      {booking.finalCents === 0 ? "Confirmar pagamento" : "Confirmar sinal recebido"}
                    </button>
                  )}
                  {booking.status === "AWAITING_FINAL_PAYMENT" && (
                    <button
                      disabled={busyId === booking.id}
                      onClick={() => callAction(booking.id, "confirm-final")}
                      className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      Confirmar restante recebido
                    </button>
                  )}
                  <button
                    disabled={busyId === booking.id}
                    onClick={() => callAction(booking.id, "cancel", { cancelledBy: "CUSTOMER" })}
                    className="rounded-md border border-red-600 text-red-600 px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Cancelar (associado desistiu)
                  </button>
                  <button
                    disabled={busyId === booking.id}
                    onClick={() => callAction(booking.id, "cancel", { cancelledBy: "ADMIN" })}
                    className="rounded-md border border-red-600 text-red-600 px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Cancelar (pela AMMA)
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
