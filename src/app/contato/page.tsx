import { email as emailConfig, whatsapp as whatsappConfig } from "@/lib/config";
import { location } from "@/lib/location";

export default function ContatoPage() {
  const whatsappDigits = whatsappConfig.displayNumber.replace(/\D/g, "");

  return (
    <div className="flex-1 mx-auto max-w-2xl px-6 py-12 w-full text-center">
      <h1 className="text-2xl font-semibold text-primary">Fale conosco</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tire suas dúvidas ou fale com a AMMA pelos canais abaixo.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <a
          href={`https://wa.me/${whatsappDigits}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-border bg-surface p-4 hover:border-primary transition-colors"
        >
          <p className="text-sm text-muted-foreground">WhatsApp</p>
          <p className="font-medium">{whatsappConfig.displayNumber}</p>
        </a>

        <a
          href={`mailto:${emailConfig.adminNotificationEmail}`}
          className="rounded-lg border border-border bg-surface p-4 hover:border-primary transition-colors"
        >
          <p className="text-sm text-muted-foreground">E-mail</p>
          <p className="font-medium">{emailConfig.adminNotificationEmail}</p>
        </a>

        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-muted-foreground">Endereço</p>
          {location.addressLines.map((line) => (
            <p key={line} className="font-medium">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
