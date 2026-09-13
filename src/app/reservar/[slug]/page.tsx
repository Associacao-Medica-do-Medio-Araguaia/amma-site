import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { earliestBookableDate, toDateOnlyString } from "@/lib/dates";
import { parseShiftOptions } from "@/lib/spaceRules";
import { getCurrentMember } from "@/lib/memberAuth";
import BookingForm from "./BookingForm";

export default async function SpaceBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const space = await prisma.space.findUnique({ where: { slug } });
  if (!space) notFound();

  const member = await getCurrentMember();
  const canBook = Boolean(member?.crm && member.phone);

  const shiftOptions = parseShiftOptions(space.shiftOptions);
  const isHourly = space.pricingUnit === "HOURLY";

  return (
    <div className="flex-1">
      <div className="bg-linear-to-b from-accent-soft to-background">
        <div className="mx-auto max-w-7xl px-6 py-11 md:py-[46px]">
          <Link href="/reservar" className="text-[13.5px] font-semibold text-secondary hover:text-primary transition-colors">
            ← Escolher outro espaço
          </Link>
          <p className="mt-4 text-[11.5px] font-semibold uppercase tracking-[.2em] text-secondary">Reservar</p>
          <h1 className="mt-3.5 text-[32px] md:text-[44px] leading-[1.1] md:leading-[1.08] font-serif font-semibold tracking-[-.02em] text-foreground">
            {space.name}
          </h1>
          <p className="mt-4 max-w-[620px] text-[15px] md:text-[16.5px] leading-relaxed text-muted-foreground">
            {space.description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-11 md:py-[52px] grid md:grid-cols-[1fr_340px] gap-[26px] md:gap-[34px] items-start">
        <div>
          {canBook ? (
            <BookingForm
              spaceSlug={space.slug}
              minDate={toDateOnlyString(earliestBookableDate(space.minAdvanceDays))}
              shiftOptions={shiftOptions}
              pricingUnit={space.pricingUnit}
              priceCents={space.priceCents}
              maxHoursPerBooking={space.maxHoursPerBooking}
              operatingStartHour={space.operatingStartHour}
              operatingEndHour={space.operatingEndHour}
              paymentType={space.paymentType}
            />
          ) : (
            <div className="rounded-2xl border border-border/40 bg-surface p-6">
              <p className="text-[15px] font-semibold text-foreground">Você precisa estar logado para reservar.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {member
                  ? "Falta completar seu cadastro (CRM e telefone) para reservar."
                  : "Entre ou cadastre-se como associado para continuar."}
              </p>
              <Link
                href="/associado"
                className="mt-4 inline-block rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {member ? "Completar cadastro" : "Entrar / Cadastrar"}
              </Link>
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-border/40 bg-surface p-6 md:sticky md:top-4 flex flex-col gap-3.5">
          <span className="self-start rounded-full bg-foreground text-background text-[12px] font-semibold px-3.5 py-1.5">
            Exclusivo para médicos associados
          </span>

          <dl className="flex flex-col gap-3 text-sm">
            {space.capacity != null && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Capacidade máxima</dt>
                <dd className="text-right font-semibold text-foreground">{space.capacity} convidados</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Antecedência mínima</dt>
              <dd className="text-right font-semibold text-foreground">{space.minAdvanceDays} dias</dd>
            </div>
            {shiftOptions.length > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Turnos</dt>
                <dd className="text-right font-semibold text-foreground">
                  {shiftOptions.map((s) => s.label).join(" ou ")}
                </dd>
              </div>
            )}
          </dl>

          <div className="border-t border-border/40 pt-3.5">
            {isHourly ? (
              <>
                <p className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Valor por hora</span>
                  <span className="text-xl font-bold text-secondary">{formatCentsToBRL(space.priceCents)}</span>
                </p>
                <p className="mt-1.5 text-[13px] text-muted-foreground">
                  Máx. {space.maxHoursPerBooking}h por associado · pagamento único até {space.finalDueDays} dias
                  antes.
                </p>
              </>
            ) : (
              <>
                <p className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Valor total</span>
                  <span className="text-xl font-bold text-secondary">{formatCentsToBRL(space.priceCents)}</span>
                </p>
                <p className="mt-2 flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Sinal a pagar agora (30%)</span>
                  <span className="font-semibold text-foreground">
                    {formatCentsToBRL(Math.round(space.priceCents * 0.3))}
                  </span>
                </p>
                <p className="mt-1.5 text-[13px] text-muted-foreground">
                  Restante pago até {space.finalDueDays} dias antes da data:{" "}
                  {formatCentsToBRL(space.priceCents - Math.round(space.priceCents * 0.3))}
                </p>
              </>
            )}
            {space.monthlyLimitPerMember != null && (
              <p className="mt-3 text-[13px] text-muted-foreground">
                Limite por associado: {space.monthlyLimitPerMember}x por mês, até {space.yearlyLimitPerMember}x por
                ano, neste espaço.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
