import QRCode from "qrcode";
import CopyPixButton from "@/components/CopyPixButton";

export default async function PixCopiarPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; valor?: string }>;
}) {
  const { codigo, valor } = await searchParams;

  if (!codigo) {
    return (
      <div className="flex-1">
        <div className="bg-linear-to-b from-accent-soft to-background">
          <div className="mx-auto max-w-7xl px-6 py-11 md:py-[46px]">
            <p className="text-[11.5px] font-semibold uppercase tracking-[.2em] text-secondary">Pagamento</p>
            <h1 className="mt-3.5 text-[32px] md:text-[44px] leading-[1.1] md:leading-[1.08] font-serif font-semibold tracking-[-.02em] text-foreground">
              Pagamento via Pix
            </h1>
          </div>
        </div>
        <div className="mx-auto max-w-md px-6 py-11 md:py-[52px] text-center text-sm text-muted-foreground">
          Código Pix não informado.
        </div>
      </div>
    );
  }

  const qrCodeDataUrl = await QRCode.toDataURL(codigo, { margin: 1, width: 240 });

  return (
    <div className="flex-1">
      <div className="bg-linear-to-b from-accent-soft to-background">
        <div className="mx-auto max-w-7xl px-6 py-11 md:py-[46px] text-center">
          <p className="text-[11.5px] font-semibold uppercase tracking-[.2em] text-secondary">Pagamento</p>
          <h1 className="mt-3.5 text-[32px] md:text-[44px] leading-[1.1] md:leading-[1.08] font-serif font-semibold tracking-[-.02em] text-foreground">
            Pagamento via Pix
          </h1>
          {valor && <p className="mt-4 text-2xl font-bold text-secondary">{valor}</p>}
        </div>
      </div>

      <div className="mx-auto max-w-md px-6 py-11 md:py-[52px]">
        <div className="rounded-2xl border border-border/40 bg-surface p-6 md:p-8 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCodeDataUrl} alt="QR Code Pix" className="rounded-xl" />

          <CopyPixButton code={codigo} />

          <p className="mt-6 text-[12.5px] font-semibold uppercase tracking-[.14em] text-border">
            Ou copie manualmente
          </p>
          <textarea
            readOnly
            value={codigo}
            rows={3}
            className="mt-2 w-full text-xs font-mono rounded-lg border border-border/40 bg-background p-3"
          />
        </div>
      </div>
    </div>
  );
}
