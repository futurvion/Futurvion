export function formatJson(input: string, minify = false): string {
    try {
        return JSON.stringify(JSON.parse(input), null, minify ? undefined : 2);
    }
    catch {
        throw new Error("Invalid JSON. Check quotes, commas, brackets and trailing commas. JSON requires double-quoted keys and strings.");
    }
}
export function encodeBase64(input: string): string {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    for (const byte of bytes)
        binary += String.fromCharCode(byte);
    return btoa(binary);
}
export function decodeBase64(input: string, url = false): string {
    let value = input.replace(/\s/g, "");
    if (url)
        value = value.replace(/-/g, "+").replace(/_/g, "/");
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 === 1 || (value.includes("=") && value.length % 4 !== 0))
        throw new Error("Invalid Base64 alphabet or padding.");
    try {
        const binary = atob(value);
        return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
    }
    catch {
        throw new Error("Cannot decode: expected Base64 containing UTF-8 text.");
    }
}
export function decodeJwt(input: string) {
    const parts = input.trim().split(".");
    if (parts.length !== 3 || !parts[0] || !parts[1] || parts.some(p => !/^[A-Za-z0-9_-]*$/.test(p)))
        throw new Error("Expected a three-part Base64URL JWT. Encrypted five-part tokens are unsupported.");
    try {
        const header = JSON.parse(decodeBase64(parts[0], true));
        const payload = JSON.parse(decodeBase64(parts[1], true));
        if (!header || !payload || typeof header !== "object" || typeof payload !== "object" || Array.isArray(header) || Array.isArray(payload))
            throw new Error();
        return { decodedAt: Date.now(), header: JSON.stringify(header, null, 2), payload: JSON.stringify(payload, null, 2), claims: payload as Record<string, unknown> };
    }
    catch {
        throw new Error("The header and payload must be Base64URL-encoded UTF-8 JSON objects.");
    }
}
const ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]];
export function inspectCron(input: string): string {
    const fields = input.trim().split(/\s+/);
    if (fields.length !== 5)
        throw new Error("Use five fields: minute, hour, day of month, month, day of week (0 = Sunday). No seconds or year.");
    fields.forEach((field, i) => {
        const [min, max] = ranges[i];
        for (const part of field.split(",")) {
            const match = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(part);
            if (!match)
                throw new Error("Supported syntax: numbers, *, lists, ascending ranges and positive steps. Names, ?, L, W and # are unsupported.");
            const base = match[1];
            const step = match[2] ? Number(match[2]) : undefined;
            const nums = base === "*" ? [] : base.split("-").map(Number);
            if (nums.some(n => n < min || n > max) || (nums.length === 2 && nums[0] > nums[1]) || (step !== undefined && (step < 1 || step > max - min + 1 || (base !== "*" && nums.length !== 2))))
                throw new Error("Field out of range, descending range or unsupported step. Use steps with * or a range.");
        }
    });
    if (fields.every(f => f === "*"))
        return "Every minute.";
    if (/^\*\/\d+$/.test(fields[0]) && fields.slice(1).every(f => f === "*"))
        return `At minutes 0, ${fields[0].slice(2)}, ... of each hour (resets each hour).`;
    if (/^\d+$/.test(fields[0]) && /^\d+$/.test(fields[1]) && fields.slice(2).every(f => f === "*"))
        return `Daily at ${fields[1].padStart(2, "0")}:${fields[0].padStart(2, "0")}.`;
    return "Syntax supported. Read the field breakdown below; no next-run or calendar feasibility prediction is made.";
}
export function buildCron(schedule: string, minute: number, hour: number, day: number): string {
    switch (schedule) {
        case "minute": return "* * * * *";
        case "hourly": return `${minute} * * * *`;
        case "weekly": return `${minute} ${hour} * * ${day}`;
        case "monthly": return `${minute} ${hour} ${day} * *`;
        default: return `${minute} ${hour} * * *`;
    }
}
