import { QRGenerator } from "@/components/tools/qr-generator";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Free QR Code Generator Online",
  "Create free QR codes for websites, text, Wi‑Fi, email, phone numbers, SMS, and contacts. Customize and download QR codes in PNG and SVG formats.",
  "/tools/qr-generator",
);

export default function QRGeneratorPage() {
  return <QRGenerator />;
}
