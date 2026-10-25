import { ToolboxShell } from "@/features/toolbox/shell";
import "@/features/toolbox/toolbox.css";
export default function Layout({ children }: {
    children: React.ReactNode;
}) { return <ToolboxShell>{children}</ToolboxShell>; }
