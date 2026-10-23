import { Sparkles, Globe2, Code2, AppWindow, Workflow, ChartNoAxesCombined, Layers3, Orbit } from "lucide-react";
import type { Service } from "@/data/services";

export function ServiceIcon({ name, size = 27 }: { name: Service["icon"]; size?: number }) {
  const Icon = { spark: Sparkles, globe: Globe2, code: Code2, app: AppWindow, flow: Workflow, chart: ChartNoAxesCombined, layers: Layers3, orbit: Orbit }[name];
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true"/>;
}
