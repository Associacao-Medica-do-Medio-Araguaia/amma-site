import { prisma } from "@/lib/prisma";
import { getCurrentMember } from "@/lib/memberAuth";
import { googleOAuth } from "@/lib/config";
import { formatCentsToBRL } from "@/lib/money";
import { formatDatePtBR } from "@/lib/dates";
import { BOOKING_STATUS_LABEL } from "@/lib/bookingStatus";
import type { MemberModel as Member } from "@/generated/prisma/models";
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
    <div className="flex-1 mx-auto max-w-4xl px-6 py-12 w-full">
      <h1 className="text-2xl font-semibold text-primary">Espaço do Associado</h1>

      {erro === "google" && (
        <p className="mt-4 text-sm text-red-600">
          Não foi possível entrar com o Google. Tente novamente ou use e-mail e senha.
        </p>
      )}

      {!member && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Login de associado</h2>
          <AssociadoAuthForms googleClientId={googleOAuth.isConfigured ? googleOAuth.clientId : undefined} />
        </section>
      )}

      {member && (
        <div className="mt-10 grid gap-8 md:grid-cols-[260px_1fr] md:items-start">
          <MemberProfileCard member={member} />

          {!member.crm || !member.phone ? (
            <section>
              <h2 className="text-xl font-semibold">Complete seu cadastro</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Falta seu CRM e telefone para liberar as reservas.
              </p>
              <CompleteProfileForm initialCrm={member.crm} initialCrmUf={member.crmUf} initialPhone={member.phone} />
            </section>
          ) : (
            <MemberBookings memberId={member.id} />
          )}
        </div>
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

function MemberProfileCard({ member }: { member: Member }) {
  return (
    <aside className="rounded-lg border border-border bg-surface p-4 text-sm md:sticky md:top-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold"
        >
          {member.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="font-medium truncate">{member.name}</p>
          {member.crm && (
            <p className="text-xs text-muted-foreground">
              CRM {member.crm}/{member.crmUf}
              {!member.crmVerifiedAt && <span className="text-amber-600"> · pendente</span>}
            </p>
          )}
        </div>
      </div>

      <dl className="mt-4 flex flex-col gap-3">
        <div>
          <dt className="text-xs text-muted-foreground">E-mail</dt>
          <dd className="break-words">{member.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Celular</dt>
          <dd>{member.phone ?? "—"}</dd>
        </div>
      </dl>

      <form action="/api/associado/logout" method="post" className="mt-4">
        <button type="submit" className="text-sm text-muted-foreground hover:underline">
          Sair
        </button>
      </form>
    </aside>
  );
}

async function MemberBookings({ memberId }: { memberId: string }) {
  const bookings = await prisma.booking.findMany({
    where: { memberId },
    include: { space: true },
    orderBy: { date: "desc" },
  });

  return (
    <section>
      <h2 className="text-xl font-semibold">Minhas reservas</h2>

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
