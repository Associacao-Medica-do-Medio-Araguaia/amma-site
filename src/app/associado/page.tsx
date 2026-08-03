import { prisma } from "@/lib/prisma";
import { getCurrentMember } from "@/lib/memberAuth";
import { googleOAuth } from "@/lib/config";
import { formatCentsToBRL } from "@/lib/money";
import { formatDatePtBR } from "@/lib/dates";
import { BOOKING_STATUS_LABEL } from "@/lib/bookingStatus";
import AssociadoAuthForms from "./AssociadoAuthForms";
import CompleteProfileForm from "./CompleteProfileForm";

export default async function AssociadoPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const member = await getCurrentMember();

  return (
    <div className="flex-1 mx-auto max-w-3xl px-6 py-12 w-full">
      <h1 className="text-2xl font-semibold text-primary">Espaço do Associado</h1>

      {erro === "google" && (
        <p className="mt-4 text-sm text-red-600">
          Não foi possível entrar com o Google. Tente novamente ou use CPF e senha.
        </p>
      )}

      {!member && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Login de associado</h2>
          <AssociadoAuthForms googleEnabled={googleOAuth.isConfigured} />
        </section>
      )}

      {member && (!member.cpf || !member.phone) && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Complete seu cadastro</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Falta seu CPF e telefone para liberar as reservas.
          </p>
          <CompleteProfileForm initialCpf={member.cpf} initialPhone={member.phone} />
        </section>
      )}

      {member && member.cpf && member.phone && (
        <MemberBookings memberId={member.id} name={member.name} />
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Como Associar-se</h2>
        {/* TODO(cliente): requisitos e processo de associação, valor da mensalidade, formulário/contato. */}
        <p className="mt-3 text-muted-foreground">
          Informações sobre como se tornar associado da AMMA em breve. Enquanto isso, fale
          conosco pela{" "}
          <a href="/contato" className="text-primary hover:underline">
            página de contato
          </a>
          .
        </p>
      </section>
    </div>
  );
}

async function MemberBookings({ memberId, name }: { memberId: string; name: string }) {
  const bookings = await prisma.booking.findMany({
    where: { memberId },
    include: { space: true },
    orderBy: { date: "desc" },
  });

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bem-vindo, {name}</h2>
        <form action="/api/associado/logout" method="post">
          <button type="submit" className="text-sm text-muted-foreground hover:underline">
            Sair
          </button>
        </form>
      </div>

      {bookings.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Você ainda não fez nenhuma reserva.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {bookings.map((booking) => (
            <li key={booking.id} className="rounded-lg border border-border bg-surface p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{booking.space.name}</span>
                <span className="text-muted-foreground">{BOOKING_STATUS_LABEL[booking.status]}</span>
              </div>
              <p className="mt-1 text-muted-foreground">
                {formatDatePtBR(booking.date)}
                {booking.shiftLabel ? ` — ${booking.shiftLabel}` : ""}
                {booking.startHour != null && !booking.shiftLabel
                  ? ` — ${booking.startHour}h às ${booking.startHour + (booking.hours ?? 0)}h`
                  : ""}
              </p>
              <p className="mt-1 text-muted-foreground">
                Total: {formatCentsToBRL(booking.totalCents)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
