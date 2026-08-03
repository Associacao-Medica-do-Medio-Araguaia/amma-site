import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminBookingsTable, { AdminBookingRow } from "./AdminBookingsTable";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { date: "asc" },
    include: { space: true, member: true },
  });

  const rows: AdminBookingRow[] = bookings.map((b) => ({
    id: b.id,
    spaceName: b.space.name,
    date: b.date.toISOString(),
    status: b.status,
    customerName: b.member.name,
    customerEmail: b.member.email,
    customerPhone: b.member.phone ?? "",
    customerCpf: b.member.cpf ?? "",
    shiftLabel: b.shiftLabel,
    startHour: b.startHour,
    hours: b.hours,
    depositCents: b.depositCents,
    finalCents: b.finalCents,
    finalDueDate: b.finalDueDate.toISOString(),
    cancelledReason: b.cancelledReason,
  }));

  return (
    <div className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reservas</h1>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:underline"
          >
            Sair
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Nenhuma reserva ainda.</p>
      ) : (
        <div className="mt-8">
          <AdminBookingsTable bookings={rows} />
        </div>
      )}
    </div>
  );
}
