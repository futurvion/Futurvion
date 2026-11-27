import { AdSenseScript } from "@/components/ads/adsense-script";

export default function BlogLayout({
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
