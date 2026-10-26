import type { Metadata } from "next";
export const utilityOrigin = "https://utility.futurvion.in";
export const tools = [
    { slug: "json-formatter", name: "JSON Formatter", category: "Data Formatting", description: "Format, minify and validate JSON with a readable side-by-side workspace.", example: '{"project":"Futurvion","free":true,"tools":6}' },
    { slug: "jwt-decoder", name: "JWT Decoder", category: "Encoding and Decoding", description: "Inspect token headers, payloads and time claims locally. No signature verification.", example: "eyJhbGciOiJub25lIn0.eyJzdWIiOiJkZW1vIiwiZXhwIjoxNzAwMDAwMDAwfQ." },
    { slug: "cron-generator", name: "Cron Expression Helper", category: "Developer Productivity", description: "Build common schedules and check five-field cron expressions.", example: "*/5 * * * *" },
    { slug: "regex-tester", name: "Regex Tester", category: "Testing and Debugging", description: "Test JavaScript patterns, highlight matches and inspect capture groups.", example: "Futurvion builds tools. Tools help developers." },
    { slug: "base64", name: "Base64 Converter", category: "Encoding and Decoding", description: "Encode and decode UTF-8 text, including Unicode characters.", example: "Hello, developer! \u2728" },
    { slug: "api-response-formatter", name: "API Response Formatter", category: "Data Formatting", description: "Make pasted JSON responses readable, with optional response metadata.", example: '{"status":"ok","data":[{"id":1,"name":"Example"}]}' },
] as const;
export type Tool = typeof tools[number];
export function utilityMetadata(title: string, description: string, path = ""): Metadata {
    const url = utilityOrigin + path;
    return { metadataBase: new URL(utilityOrigin), title: `${title} | Futurvion Developer Tools`, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "Futurvion Developer Tools", type: "website", images: [] }, twitter: { card: "summary", title, description, images: [] }, robots: { index: true, follow: true } };
}
