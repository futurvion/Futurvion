import { AdSenseScript } from "@/components/ads/adsense-script";

export default function JobsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <AdSenseScript />
    </>
  );
}
