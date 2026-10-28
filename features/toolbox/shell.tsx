import Link from "next/link";
import Image from "next/image";
import { HeaderSearch } from "./header-search";
import { tools } from "./catalog";
export function ToolboxShell({ children }: {
    children: React.ReactNode;
}) {
    return (
        <div className="toolbox">
            <a className="tb-skip" href="#toolbox-main">Skip to tools</a>
            <header className="tb-header">
                <Link href="/" className="tb-brand">
                    <Image
                        src="/Logo with Full Name.png"
                        alt="Futurvion — Digital Solutions for Every Business"
                        width={2160}
                        height={728}
                        unoptimized
                    />
                    <strong><small>Developer Tools</small></strong>
                </Link>
                <HeaderSearch />
                <a href="https://futurvion.in" target="_blank" rel="noopener noreferrer">Main website</a>
            </header>
            <aside className="tb-sidebar">
                <p>Toolbox</p>
                <Link href="/">All tools</Link>
                <nav aria-label="Tools">
                    {tools.map(tool => (
                        <Link key={tool.slug} href={`/tools/${tool.slug}`}>{tool.name}</Link>
                    ))}
                </nav>
                <p className="tb-sidebar-note">Free. No login required.<br />Your workspace stays in this tab.</p>
                <Link href="/privacy">Privacy & data handling</Link>
            </aside>
            <main id="toolbox-main" className="tb-sheet">
                {children}
                <AdSlot placement="tool-bottom" />
                <footer className="tb-footer">
                    <span>Futurvion Developer Tools / Free for everyone</span>
                    <Link href="/privacy">Privacy</Link>
                    <Link href="/">Browse tools</Link>
                </footer>
            </main>
        </div>
    );
}
// Disabled deliberately. No SDK, placeholder, reserved space or network activity.
export function AdSlot({ placement }: {
    placement: "directory" | "tool-bottom";
}) { void placement; return null; }
