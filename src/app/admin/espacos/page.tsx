import Link from "next/link";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/adminAuth";
import AdminSpacesList from "./AdminSpacesList";

export default async function AdminSpacesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const spaces = await prisma.space.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Espaços</h1>
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
        <Link
          href="/admin"
          className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Reservas
        </Link>
        <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
          Espaços
        </span>
      </nav>

      <div className="mt-8">
        <AdminSpacesList
          spaces={spaces.map((space) => ({
            id: space.id,
            name: space.name,
            description: space.description,
            pricingUnit: space.pricingUnit,
            priceCents: space.priceCents,
            capacity: space.capacity,
            minAdvanceDays: space.minAdvanceDays,
            monthlyLimitPerMember: space.monthlyLimitPerMember,
            yearlyLimitPerMember: space.yearlyLimitPerMember,
            maxHoursPerBooking: space.maxHoursPerBooking,
          }))}
        />
      </div>
    </div>
  );
}
