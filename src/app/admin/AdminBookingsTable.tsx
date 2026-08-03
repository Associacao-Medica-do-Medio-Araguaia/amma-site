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
  customerCpf: string;
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
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-border">
              <th className="py-2 pr-4">Data</th>
              <th className="py-2 pr-4">Espaço</th>
              <th className="py-2 pr-4">Cliente</th>
              <th className="py-2 pr-4">Contato</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Sinal</th>
              <th className="py-2 pr-4">Restante</th>
              <th className="py-2 pr-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const schedule = formatSchedule(booking);
              return (
                <tr key={booking.id} className="border-b border-border/50 align-top">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {formatDatePtBR(new Date(booking.date))}
                    {schedule && <div className="text-xs text-muted-foreground">{schedule}</div>}
                  </td>
                  <td className="py-2 pr-4">{booking.spaceName}</td>
                  <td className="py-2 pr-4">
                    {booking.customerName}
                    <div className="text-xs text-muted-foreground">CPF: {booking.customerCpf}</div>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <div>{booking.customerEmail}</div>
                    <div>{booking.customerPhone}</div>
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">
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
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">{formatCentsToBRL(booking.depositCents)}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{formatCentsToBRL(booking.finalCents)}</td>
                  <td className="py-2 pr-4">
                    <div className="flex flex-col gap-1 min-w-[11rem]">
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
                      {(booking.status === "AWAITING_DEPOSIT" ||
                        booking.status === "AWAITING_FINAL_PAYMENT") && (
                        <>
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
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
