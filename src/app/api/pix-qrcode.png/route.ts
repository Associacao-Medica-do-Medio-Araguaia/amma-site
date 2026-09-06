import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { buildStaticPixPayload } from "@/lib/pix";

// Serve o QR code Pix (estático) como PNG — usado no e-mail de lembrete de pagamento, que
// exige uma URL de imagem pública (não aceita data URI).
export async function GET() {
  const buffer = await QRCode.toBuffer(buildStaticPixPayload(), { margin: 1, width: 280 });
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
  });
}
