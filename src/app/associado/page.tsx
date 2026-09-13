import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getCurrentMember } from "@/lib/memberAuth";
import { googleOAuth, whatsapp as whatsappConfig } from "@/lib/config";
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

  if (!member) {
    return (
      <div className="flex-1 grid md:grid-cols-2">
        <div className="relative overflow-hidden flex flex-col justify-between gap-10 px-6 py-10 md:px-12 md:py-11 text-white">
          <Image src="/fotos/fachada.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover -z-20" />
          <div className="absolute inset-0 -z-10 bg-foreground/[.82] mix-blend-multiply" />
          <Image
            src="/logo.png"
            alt="AMMA"
            width={681}
            height={696}
            className="hidden md:block w-3/5 max-w-[320px] h-auto self-center brightness-0 invert"
          />
          {/* texto no centro */}
          <div className="md:text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-[.22em] text-surface-muted">
              Sede AMMA · desde 1981
            </p>
            <h2 className="mt-3.5 text-[28px] md:text-[38px] leading-[1.14] font-serif font-semibold tracking-[-.02em]">
              O acesso dos associados à sede.
            </h2>
            <p className="mt-4 text-[14.5px] md:text-[15.5px] leading-relaxed text-accent-soft/90">
              Entre para reservar os espaços, acompanhar suas reservas e consultar a agenda da
              sede.
            </p>
            <p className="mt-4 text-[13px] leading-relaxed text-accent-soft/60">
              Dúvidas com o acesso? Fale com a secretaria
              <br />
              {whatsappConfig.displayNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 md:px-12 md:py-11">
          <div className="w-full max-w-[392px]">
            <h1 className="text-[27px] md:text-[31px] font-serif font-semibold tracking-[-.02em] text-foreground">
              Espaço do Associado
            </h1>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted-foreground">
              Acesso exclusivo para médicos associados da AMMA.
            </p>

            {erro === "google" && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Não foi possível entrar com o Google. Tente novamente ou use e-mail e senha.
              </p>
            )}

            <AssociadoAuthForms googleClientId={googleOAuth.isConfigured ? googleOAuth.clientId : undefined} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 mx-auto max-w-4xl px-6 py-12 w-full">
      <h1 className="text-2xl font-semibold text-foreground">Espaço do Associado</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[260px_1fr] md:items-start">
        <MemberProfileCard member={member} />

        {!member.crm || !member.phone ? (
          <section>
            <h2 className="text-xl font-semibold text-foreground">Complete seu cadastro</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Falta seu CRM e telefone para liberar as reservas.
            </p>
            <CompleteProfileForm initialCrm={member.crm} initialCrmUf={member.crmUf} initialPhone={member.phone} />
          </section>
        ) : (
          <MemberBookings memberId={member.id} />
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-foreground">Como Associar-se</h2>
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
    <aside className="rounded-2xl border border-border/40 bg-surface p-4 text-sm md:sticky md:top-4">
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
        <button type="submit" className="text-sm text-muted-foreground hover:cursor-pointer hover:underline">
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
      <h2 className="text-xl font-semibold text-foreground">Minhas reservas</h2>

      {bookings.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Você ainda não fez nenhuma reserva.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {bookings.map((booking) => (
            <li key={booking.id} className="rounded-2xl border border-border/40 bg-surface p-4 text-sm">
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
