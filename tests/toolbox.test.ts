import { describe, expect, it } from "vitest";
import { formatJson, encodeBase64, decodeBase64, decodeJwt, inspectCron, buildCron } from "@/features/toolbox/logic";
import { isUtilityHost, utilityDestination } from "@/features/toolbox/routing";
describe("anonymous toolbox transformations", () => {
    it("formats and minifies JSON without exposing bad input in errors", () => { expect(formatJson('{"a":1}', true)).toBe('{"a":1}'); expect(formatJson('{"a":1}')).toContain('\n  "a": 1'); expect(() => formatJson("private secret")).toThrow("Invalid JSON. Check"); });
    it("roundtrips UTF-8 and rejects invalid base64 or binary", () => { const value = "\u0939\u0948\u0932\u094b \u{1f30d} caf\u00e9"; expect(decodeBase64(encodeBase64(value))).toBe(value); for (const value of ["a", "a===", "%%%%", "/w=="])
        expect(() => decodeBase64(value)).toThrow(); });
    it("decodes Base64URL JWT objects without signature verification", () => { const token = [encodeBase64('{"alg":"none"}'), encodeBase64('{"sub":"\u4f8b","exp":0}')].map(s => s.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")).join(".") + "."; expect(decodeJwt(token).claims.sub).toBe("\u4f8b"); expect(() => decodeJwt("secret")).toThrow("Expected"); expect(() => decodeJwt("W10.W10.")).toThrow("JSON objects"); });
    it("validates bounded five-field cron syntax without guessing extensions", () => { expect(inspectCron("0 0 * * *")).toBe("Daily at 00:00."); expect(inspectCron("*/5 * * * *")).toContain("each hour"); expect(inspectCron("0,15 1-5 * * 1-5")).toContain("Syntax supported"); for (const s of ["60 * * * *", "0 24 * * *", "* * 0 * *", "*/0 * * * *", "0 0 * * MON", "0 0 * * 7", "0 0 L * *", "0 0 * * * *", "5/2 * * * *"])
        expect(() => inspectCron(s)).toThrow(); expect(buildCron("weekly", 5, 9, 1)).toBe("5 9 * * 1"); });
    it("isolates exact utility host and never maps admin or APIs", () => { expect(isUtilityHost("utility.futurvion.in:443")).toBe(true); expect(isUtilityHost("utility.localhost:3000")).toBe(true); for (const host of ["futurvion.in", "utility.futurvion.in.attacker.com", "preview.vercel.app"])
        expect(isUtilityHost(host)).toBe(false); expect(utilityDestination("/tools/base64")).toBe("/toolbox-internal/tools/base64"); for (const path of ["/admin", "/api/admin/jobs", "/contact", "/toolbox-internal", "/tools/unknown"])
        expect(utilityDestination(path)).toBeNull(); });
    it("enables the reserved localhost toolbox port only in development", () => {
        for (const host of ["localhost:3001", "127.0.0.1:3001", "[::1]:3001"]) {
            expect(isUtilityHost(host, true)).toBe(true);
            expect(isUtilityHost(host, false)).toBe(false);
        }
        for (const host of ["localhost:3000", "localhost:3002", "futurvion.in:3001", "preview.vercel.app:3001", "localhost.attacker.com:3001"]) {
            expect(isUtilityHost(host, true)).toBe(false);
        }
    });

});
