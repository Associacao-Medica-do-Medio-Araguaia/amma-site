import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/money";
import { formatDatePtBR } from "@/lib/dates";
import { buildStaticPixPayload } from "@/lib/pix";
import { email as emailConfig, whatsapp as whatsappConfig } from "@/lib/config";

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
    <div className="flex-1 mx-auto max-w-2xl px-6 py-12 w-full">
      <h1 className="text-2xl font-semibold">Reserva recebida!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {booking.space.name} em {formatDatePtBR(booking.date)}
        {booking.shiftLabel ? ` — ${booking.shiftLabel}` : ""}
        {booking.startHour != null && !booking.shiftLabel
          ? ` — ${booking.startHour}h às ${booking.startHour + (booking.hours ?? 0)}h`
          : ""}
        . Código da reserva: <span className="font-mono">{booking.id}</span>
      </p>

      <div className="mt-8 rounded-lg border border-border bg-surface p-6 flex flex-col items-center text-center">
        <p className="text-sm text-muted-foreground">Valor a pagar agora</p>
        <p className="text-3xl font-semibold mt-1">{formatCentsToBRL(amountDue)}</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrCodeDataUrl} alt="QR Code Pix" className="mt-6 rounded-md" />

        <p className="mt-4 text-xs text-muted-foreground">Pix copia e cola</p>
        <textarea
          readOnly
          value={pixPayload}
          rows={3}
          className="mt-2 w-full text-xs font-mono rounded-md border border-border bg-background p-2"
        />
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface p-6 text-sm space-y-3">
        <p className="font-medium">Depois de pagar, envie o comprovante:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Por e-mail: <span className="font-medium">{emailConfig.adminNotificationEmail}</span>
          </li>
          <li>
            Ou pelo WhatsApp: <span className="font-medium">{whatsappConfig.displayNumber}</span>
          </li>
        </ul>
        <p className="text-muted-foreground">
          Inclua o código da reserva (<span className="font-mono">{booking.id}</span>) na
          mensagem para agilizar a confirmação.
        </p>
        {booking.status === "AWAITING_DEPOSIT" && booking.finalCents > 0 && (
          <p className="text-muted-foreground">
            Faltando {booking.space.finalDueDays} dias para a data reservada, enviaremos um
            lembrete por e-mail para o pagamento dos{" "}
            {formatCentsToBRL(booking.finalCents)} restantes. Se o pagamento não for
            identificado até o prazo, a reserva será cancelada automaticamente.
          </p>
        )}
        {booking.status === "AWAITING_DEPOSIT" && booking.finalCents === 0 && (
          <p className="text-muted-foreground">
            Esse é um pagamento único. Se não for identificado até{" "}
            {formatDatePtBR(booking.finalDueDate)}, a reserva será cancelada automaticamente.
          </p>
        )}
      </div>

      <Link href="/" className="mt-8 inline-block text-sm underline">
        Voltar para a página inicial
      </Link>
    </div>
  );
}
