import { tools } from "./catalog";
export const internalPrefix = "/toolbox-internal";
export function isUtilityHost(host: string, development = false): boolean {
    const hostname = host.toLowerCase().replace(/:\d+$/, "");
    return hostname === "utility.futurvion.in" || hostname === "utility.localhost" ||
        (development && ["localhost:3001", "127.0.0.1:3001", "[::1]:3001"].includes(host.toLowerCase()));
}
export function utilityDestination(path: string): string | null {
    if (path === "/")
        return internalPrefix;
    if (path === "/privacy")
        return `${internalPrefix}/privacy`;
    if (tools.some(tool => path === `/tools/${tool.slug}`))
        return internalPrefix + path;
    return null;
}
