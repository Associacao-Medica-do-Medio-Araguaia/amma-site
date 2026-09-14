import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { formatDatePtBR } from "@/lib/dates";
import { buildStaticPixPayload } from "@/lib/pix";
import { email as emailConfig, whatsapp as whatsappConfig } from "@/lib/config";
import CopyPixButton from "@/components/CopyPixButton";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { space: true } });
  if (!booking) notFound();

  const amountDue =
    booking.status === "AWAITING_DEPOSIT" ? booking.depositCents : booking.finalCents;
  const pixPayload = buildStaticPixPayload();
  const qrCodeDataUrl = await QRCode.toDataURL(pixPayload, { margin: 1, width: 280 });

  return (
    <div className="flex-1">
      <div className="bg-linear-to-b from-accent-soft to-background">
        <div className="mx-auto max-w-7xl px-6 py-11 md:py-[46px]">
          <p className="text-[11.5px] font-semibold uppercase tracking-[.2em] text-secondary">Reserva confirmada</p>
          <h1 className="mt-3.5 text-[32px] md:text-[44px] leading-[1.1] md:leading-[1.08] font-serif font-semibold tracking-[-.02em] text-foreground">
            Reserva recebida!
          </h1>
          <p className="mt-4 max-w-[620px] text-[15px] md:text-[16.5px] leading-relaxed text-muted-foreground">
            {booking.space.name} em {formatDatePtBR(booking.date)}
            {booking.shiftLabel ? ` — ${booking.shiftLabel}` : ""}
            {booking.startHour != null && !booking.shiftLabel
              ? ` — ${booking.startHour}h às ${booking.startHour + (booking.hours ?? 0)}h`
              : ""}
            . Código da reserva: <span className="font-mono text-foreground">{booking.id}</span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-11 md:py-[52px] flex flex-col gap-5">
        <div className="rounded-2xl border border-border/40 bg-surface p-6 md:p-8 flex flex-col items-center text-center">
          <p className="text-sm text-muted-foreground">Valor a pagar agora</p>
          <p className="mt-1 text-3xl font-bold text-secondary">{formatCentsToBRL(amountDue)}</p>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCodeDataUrl} alt="QR Code Pix" className="mt-6 rounded-xl" />

          <CopyPixButton code={pixPayload} />

          <p className="mt-6 text-[12.5px] font-semibold uppercase tracking-[.14em] text-border">
            Ou copie manualmente
          </p>
          <textarea
            readOnly
            value={pixPayload}
            rows={3}
            className="mt-2 w-full text-xs font-mono rounded-lg border border-border/40 bg-background p-3"
          />
        </div>

        <div className="rounded-2xl border border-border/40 bg-surface p-6 md:p-8 text-[14.5px] leading-relaxed text-muted-foreground space-y-3">
          <p className="font-semibold text-foreground">Depois de pagar, envie o comprovante:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li className="break-words">
              Por e-mail: <span className="font-semibold text-foreground">{emailConfig.adminNotificationEmail}</span>
            </li>
            <li>
              Ou pelo WhatsApp: <span className="font-semibold text-foreground">{whatsappConfig.displayNumber}</span>
            </li>
          </ul>
          <p>
            Inclua o código da reserva (<span className="font-mono text-foreground">{booking.id}</span>) na
            mensagem para agilizar a confirmação.
          </p>
          {booking.status === "AWAITING_DEPOSIT" && booking.finalCents > 0 && (
            <p>
              Faltando {booking.space.finalDueDays} dias para a data reservada, enviaremos um
              lembrete por e-mail para o pagamento dos{" "}
              {formatCentsToBRL(booking.finalCents)} restantes. Se o pagamento não for
              identificado até o prazo, a reserva será cancelada automaticamente.
            </p>
          )}
          {booking.status === "AWAITING_DEPOSIT" && booking.finalCents === 0 && (
            <p>
              Esse é um pagamento único. Se não for identificado até{" "}
              {formatDatePtBR(booking.finalDueDate)}, a reserva será cancelada automaticamente.
            </p>
          )}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
