import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import AdminBookingsTable, { AdminBookingRow } from "./AdminBookingsTable";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
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
    customerCrm: b.member.crm ? `${b.member.crm}/${b.member.crmUf}` : "",
    customerCrmVerified: Boolean(b.member.crmVerifiedAt),
    customerCrmVerifiedName: b.member.crmVerifiedName ?? "",
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
        <div>
          <h1 className="text-2xl font-semibold">Reservas</h1>
          <p className="text-sm text-muted-foreground">Olá, {admin.name}</p>
        </div>
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
