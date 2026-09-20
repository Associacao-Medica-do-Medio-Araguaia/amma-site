import Link from "next/link";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import AdminBookingsTable, { AdminBookingRow } from "./AdminBookingsTable";

// month é 1-indexado (1 = janeiro), como em searchParams, pra evitar confusão com o
// getUTCMonth() (0-indexado) do Date nativo.
function monthRangeUTC(year: number, month: number) {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const { year: yearParam, month: monthParam } = await searchParams;
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;

  const year = Number(yearParam) || currentYear;
  const month = Number(monthParam) || currentMonth;
  const isCurrentMonth = year === currentYear && month === currentMonth;

  const { start, end } = monthRangeUTC(year, month);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const monthLabel = start.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const bookings = await prisma.booking.findMany({
    where: { date: { gte: start, lt: end } },
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
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </form>
      </div>

      <nav className="mt-6 flex items-center gap-1 rounded-full border border-border bg-surface p-1.5 shadow-sm w-fit">
        <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
          Reservas
        </span>
        <Link
          href="/admin/espacos"
          className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Espaços
        </Link>
      </nav>

      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1.5 shadow-sm">
          <Link
            href={`/admin?year=${prev.year}&month=${prev.month}`}
            aria-label="Mês anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronLeft className="h-[18px] w-[18px]" />
          </Link>
          <p className="w-40 text-center text-base font-semibold text-primary capitalize">
            {monthLabel}
          </p>
          <Link
            href={`/admin?year=${next.year}&month=${next.month}`}
            aria-label="Próximo mês"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronRight className="h-[18px] w-[18px]" />
          </Link>
        </div>
        {!isCurrentMonth && (
          <Link
            href="/admin"
            className="rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Voltar para o mês atual
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground text-center">
          Nenhuma reserva em {monthLabel}.
        </p>
      ) : (
        <div className="mt-8">
          <AdminBookingsTable bookings={rows} />
        </div>
      )}
    </div>
  );
}
