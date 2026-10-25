import Link from "next/link";
import { notFound } from "next/navigation";
import { tools, utilityMetadata } from "@/features/toolbox/catalog";
import { Workspace } from "@/features/toolbox/workspace";
export const dynamicParams = false;
export function generateStaticParams() { return tools.map(t => ({ slug: t.slug })); }
export async function generateMetadata({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) { const { slug } = await params; const tool = tools.find(t => t.slug === slug); return tool ? utilityMetadata(tool.name, tool.description, `/tools/${slug}`) : {}; }
export default async function Page({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) {
    const { slug } = await params;
    const tool = tools.find(t => t.slug === slug);
    if (!tool)
        notFound();
    return <><nav aria-label="Breadcrumb" className="tb-breadcrumb"><Link href="/">All tools</Link><span>/</span><span>{tool.name}</span></nav><div className="tb-tool-heading"><p className="tb-muted">{tool.category} / Free / No Login Required</p><h1>{tool.name}</h1><p>{tool.description}</p></div><Workspace key={slug} tool={tool}/><section className="tb-help"><h2>How to use</h2><p>Enter your content or load the example, choose an action, then copy the result. Clear removes your current workspace. No content is submitted to a server.</p><details><summary>Will my content be saved?</summary><p>No. Your workspace uses page memory only. Leaving or refreshing resets it. Copying places output on your system clipboard.</p></details><details><summary>Do I need an account or payment?</summary><p>No. Every feature is free and opens directly without registration.</p></details><h2>Related tools</h2><div className="tb-related">{tools.filter(t => t.slug !== slug).map(t => <Link key={t.slug} href={`/tools/${t.slug}`}>{t.name}</Link>)}</div></section></>;
}
