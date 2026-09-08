import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { parseShiftOptions } from "@/lib/spaceRules";

export const dynamic = "force-dynamic";

export default async function RegrasDeUsoPage() {
  const spaces = await prisma.space.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex-1 mx-auto max-w-3xl px-6 py-12 w-full">
      <h1 className="text-2xl font-semibold text-primary">Regras de Uso</h1>
      <p className="mt-2 rounded-lg bg-amber-100 text-amber-900 text-sm px-4 py-2 inline-block">
        Reservas exclusivas para médicos associados à AMMA.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Horários, capacidade e condições de reserva de cada espaço.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {spaces.map((space) => {
          const shiftOptions = parseShiftOptions(space.shiftOptions);
          const isHourly = space.pricingUnit === "HOURLY";
          return (
            <div key={space.id} className="rounded-lg border border-border bg-surface p-5">
              <h2 className="font-semibold text-primary">{space.name}</h2>
              <ul className="mt-3 text-sm text-muted-foreground space-y-1 list-disc list-inside">
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

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Cancelamento</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          O cancelamento pelo associado pode ser feito com até 7 dias de antecedência da data do
          evento. Nesse caso, é devolvido o valor já pago referente aos 70% restantes — o sinal de
          30% pago no ato da reserva fica retido como taxa de limpeza. Se o cancelamento for feito
          pela AMMA, todo o valor pago é devolvido integralmente.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Normas de convivência</h2>
        {/* TODO(cliente): regras específicas de convivência, barulho, uso de área comum etc. */}
        <p className="mt-3 text-sm text-muted-foreground">Normas detalhadas em breve.</p>
      </section>
    </div>
  );
}
