import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { parseShiftOptions } from "@/lib/spaceRules";

export const dynamic = "force-dynamic";

export default async function RegrasDeUsoPage() {
  const spaces = await prisma.space.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex-1 pb-12 md:pb-16">
      <div className="bg-linear-to-b from-accent-soft to-background">
        <div className="mx-auto max-w-7xl px-6 pt-8 pb-4 md:pt-12 md:pb-6">
          <p className="text-[11.5px] font-semibold uppercase tracking-[.2em] text-secondary">Regras de uso</p>
          <h1 className="mt-3.5 text-[32px] md:text-[44px] leading-[1.1] md:leading-[1.08] font-serif font-semibold tracking-[-.02em] text-foreground">
            Horários, capacidade e condições
          </h1>
          <p className="mt-4 max-w-[600px] text-[15px] md:text-[16.5px] leading-relaxed text-muted-foreground">
            Cada espaço tem suas próprias regras de reserva. Reservas exclusivas para médicos
            associados à AMMA.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-4 pb-3 md:pt-6 md:pb-4 grid md:grid-cols-2 gap-[18px]">
        {spaces.map((space) => {
          const shiftOptions = parseShiftOptions(space.shiftOptions);
          const isHourly = space.pricingUnit === "HOURLY";
          return (
            <div key={space.id} className="rounded-2xl border border-border/40 bg-surface p-6">
              <h2 className="text-[21px] font-semibold text-secondary">{space.name}</h2>
              <ul className="mt-3.5 list-disc pl-[18px] text-[14.5px] leading-[1.8] text-muted-foreground space-y-0.5">
                {space.capacity != null && <li>Capacidade máxima: {space.capacity} convidados</li>}
                <li>Antecedência mínima para reservar: {space.minAdvanceDays} dias</li>
                {isHourly ? (
                  <>
                    <li>
                      Uso de até {space.maxHoursPerBooking}h por associado, das{" "}
                      {space.operatingStartHour}h às {space.operatingEndHour}h
                    </li>
                    <li>Valor: {formatCentsToBRL(space.priceCents)} por hora, pagamento único</li>
                    <li>Pagamento até {space.finalDueDays} dias antes da data de uso</li>
                  </>
                ) : (
                  <>
                    {shiftOptions.length > 0 && (
                      <li>Turnos disponíveis: {shiftOptions.map((s) => s.label).join(" ou ")}</li>
                    )}
                    <li>Valor total: {formatCentsToBRL(space.priceCents)}</li>
                    <li>Sinal de 30% pago no ato da reserva</li>
                    <li>Restante (70%) pago até {space.finalDueDays} dias antes do evento</li>
                    {space.monthlyLimitPerMember != null && (
                      <li>
                        Limite por associado: {space.monthlyLimitPerMember}x por mês, até{" "}
                        {space.yearlyLimitPerMember}x por ano
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-3 pb-6 md:pt-4 grid md:grid-cols-[1.4fr_1fr] gap-[18px] items-start">
        <div className="rounded-2xl bg-foreground text-accent-soft p-[26px]">
          <h2 className="text-[21px] font-semibold text-white">Cancelamento</h2>
          <p className="mt-3 text-[15px] leading-[1.7] text-accent-soft/90">
            O cancelamento pelo associado pode ser feito com até{" "}
            <strong className="text-surface-muted">7 dias de antecedência</strong> da data do
            evento. Nesse caso, é devolvido o valor já pago referente aos 70% restantes — o sinal
            de 30% fica retido como taxa de limpeza. Se o cancelamento for feito pela AMMA, todo o
            valor pago é devolvido integralmente.
          </p>
        </div>
        <div className="rounded-2xl bg-accent-soft p-[26px]">
          <h2 className="text-[21px] font-semibold text-foreground">Normas de convivência</h2>
          {/* TODO(cliente): regras específicas de convivência, barulho, uso de área comum etc. */}
          <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">
            Disponíveis em breve.
          </p>
        </div>
      </div>
    </div>
  );
}