import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { site } from "@/config/site";
function request(host: string, path: string) { return new NextRequest(`https://${host}${path}`, { headers: { host } }); }
describe("canonical host redirect", () => {
    it("redirects www URLs to the canonical host and preserves the path and query", () => {
        const canonicalUrl = new URL(site.url);
        const result = proxy(request(`www.${canonicalUrl.host}`, "/blog/what-are-ai-agents?ref=search"));
        expect(result.status).toBe(308);
        expect(result.headers.get("location")).toBe(`${site.url}/blog/what-are-ai-agents?ref=search`);
    });
});
describe("toolbox host boundary", () => {
    it("rewrites public tool URLs without adding auth or cookies", () => { for (const path of ["/", "/privacy", "/tools/json-formatter", "/tools/jwt-decoder", "/tools/cron-generator", "/tools/regex-tester", "/tools/base64", "/tools/api-response-formatter"]) {
        const result = proxy(request("utility.futurvion.in", path));
        expect(result.status).toBe(200);
        expect(result.headers.get("x-middleware-rewrite")).toContain("/toolbox-internal");
        expect(result.headers.has("set-cookie")).toBe(false);
    } });
    it("rejects main-site APIs, administration and internal paths on utility", () => { for (const path of ["/admin", "/admin/login", "/admin/jobs", "/api/jobs", "/api/admin/auth/session", "/api/contact", "/toolbox-internal", "/toolbox-internal/tools/base64"]) {
        expect(proxy(request("utility.futurvion.in", path)).status).toBe(404);
    } });
    it("keeps main-site auth and routes untouched and blocks internal namespace", () => { for (const path of ["/", "/admin", "/api/admin/auth/session", "/work"]) {
        expect(proxy(request("futurvion.in", path)).headers.get("x-middleware-next")).toBe("1");
    } expect(proxy(request("futurvion.in", "/toolbox-internal")).status).toBe(404); const req = request("futurvion.in", "/admin"); req.headers.set("x-forwarded-host", "utility.futurvion.in"); expect(proxy(req).headers.has("x-middleware-rewrite")).toBe(false); });
    it("provides utility-only discovery", () => { expect(proxy(request("utility.futurvion.in", "/robots.txt")).headers.get("content-type")).toBe("text/plain"); expect(proxy(request("utility.futurvion.in", "/sitemap.xml")).headers.get("content-type")).toBe("application/xml"); });
});
