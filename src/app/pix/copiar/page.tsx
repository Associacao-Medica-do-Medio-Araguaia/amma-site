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
      <div className="flex-1 mx-auto max-w-md px-6 py-12 w-full text-center text-sm text-muted-foreground">
        Código Pix não informado.
      </div>
    );
  }

  const qrCodeDataUrl = await QRCode.toDataURL(codigo, { margin: 1, width: 240 });

  return (
    <div className="flex-1 mx-auto max-w-md px-6 py-12 w-full">
      <h1 className="text-xl font-semibold text-center">Pagamento via Pix</h1>
      {valor && <p className="mt-2 text-center text-2xl font-semibold">{valor}</p>}

      <div className="mt-6 rounded-lg border border-border bg-surface p-6 flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrCodeDataUrl} alt="QR Code Pix" className="rounded-md" />

        <CopyPixButton code={codigo} />

        <p className="mt-6 text-xs text-muted-foreground">Ou copie manualmente</p>
        <textarea
          readOnly
          value={codigo}
          rows={3}
          className="mt-2 w-full text-xs font-mono rounded-md border border-border bg-background p-2"
        />
      </div>
    </div>
  );
}
