import { NextResponse, type NextRequest } from "next/server";
import { internalPrefix, isUtilityHost, utilityDestination } from "@/features/toolbox/routing";
import { tools, utilityOrigin } from "@/features/toolbox/catalog";
export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    if (path === internalPrefix || path.startsWith(internalPrefix + "/"))
        return new NextResponse("Not found", { status: 404 });
    if (!isUtilityHost(request.headers.get("host") || "", process.env.NODE_ENV === "development"))
        return NextResponse.next();
    if (path.startsWith("/_next/static/") || path.startsWith("/_next/webpack-hmr") || (path === "/icon.png" || path === "/logo-mark.png") || path === "/toolbox-regex-worker.js")
        return NextResponse.next();
    if (path === "/robots.txt")
        return new NextResponse(`User-agent: *\nAllow: /\nSitemap: ${utilityOrigin}/sitemap.xml\n`, { headers: { "Content-Type": "text/plain" } });
    if (path === "/sitemap.xml")
        return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["", "/privacy", ...tools.map(t => "/tools/" + t.slug)].map(p => `<url><loc>${utilityOrigin}${p}</loc></url>`).join("")}</urlset>`, { headers: { "Content-Type": "application/xml" } });
    const destination = utilityDestination(path);
    if (!destination)
        return new NextResponse("Not found", { status: 404 });
    const url = request.nextUrl.clone();
    url.pathname = destination;
    url.search = "";
    return NextResponse.rewrite(url);
}
