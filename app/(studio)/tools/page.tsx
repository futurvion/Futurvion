import { ToolsDirectory } from "@/components/tools/tools-directory";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Free Online Tools",
  "Explore free online tools from Futurvion. Generate QR codes and discover simple, powerful tools to make everyday tasks easier.",
  "/tools",
);

export default function ToolsPage() {
  return <ToolsDirectory />;
}
