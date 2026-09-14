import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { email as emailConfig, whatsapp as whatsappConfig } from "@/lib/config";
import { location } from "@/lib/location";

export default function ContatoPage() {
  const whatsappDigits = whatsappConfig.displayNumber.replace(/\D/g, "");

  return (
    <div className="flex-1 pb-12 md:pb-16">
      <div className="bg-linear-to-b from-accent-soft to-background">
        <div className="mx-auto max-w-7xl px-6 pt-8 pb-4 md:pt-12 md:pb-6">
          <p className="text-[11.5px] font-semibold uppercase tracking-[.2em] text-secondary">Contato</p>
          <h1 className="mt-3.5 text-[32px] md:text-[44px] leading-[1.1] md:leading-[1.08] font-serif font-semibold tracking-[-.02em] text-foreground">
            Fale conosco
          </h1>
          <p className="mt-4 max-w-[560px] text-[15px] md:text-[16.5px] leading-relaxed text-muted-foreground">
            Tire suas dúvidas ou fale com a AMMA pelos canais abaixo.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-4 pb-6 md:pt-6 grid md:grid-cols-[1fr_1.15fr] gap-[34px] items-start">
        <div className="min-w-0 flex flex-col gap-3.5">
          <a
            href={`https://wa.me/${whatsappDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-border/40 bg-surface p-[22px] flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4.5 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4.5 min-w-0">
              <span className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-secondary">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold uppercase tracking-[.14em] text-border">WhatsApp</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{whatsappConfig.displayNumber}</p>
              </div>
            </div>
            <span className="self-center sm:self-auto sm:ml-auto shrink-0 rounded-lg bg-primary text-primary-foreground hover:opacity-90 px-5 py-2.5 text-[13.5px] font-semibold">
              Abrir conversa
            </span>
          </a>

          <a
            href={`mailto:${emailConfig.adminNotificationEmail}`}
            className="rounded-2xl border border-border/40 bg-surface p-[22px] flex items-center gap-4.5 hover:border-primary transition-colors"
          >
            <span className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-secondary">
              <Mail className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold uppercase tracking-[.14em] text-border">E-mail</p>
              <p className="mt-1 text-lg font-semibold text-foreground truncate">{emailConfig.adminNotificationEmail}</p>
            </div>
          </a>

          <div className="rounded-2xl border border-border/40 bg-surface p-[22px]">
            <p className="text-[12.5px] font-semibold uppercase tracking-[.14em] text-border">Endereço</p>
            <p className="mt-2 text-[16.5px] leading-[1.7] text-foreground">
              {location.addressLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
            <a
              href={location.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-[14.5px] font-semibold text-secondary hover:text-primary transition-colors"
            >
              Ver no Google Maps
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="min-w-0">
          <div className="overflow-hidden rounded-[18px] border border-border/40 h-[300px] md:h-[430px]">
            <iframe
              title="Mapa da localização da AMMA"
              src={location.embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
