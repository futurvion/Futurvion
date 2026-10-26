"use client";
import { useEffect, useRef, useState } from "react";
import type { Tool } from "./catalog";
import { buildCron, decodeBase64, decodeJwt, encodeBase64, formatJson, inspectCron } from "./logic";
type Match = {
    index: number;
    value: string;
    groups: (string | null)[];
    named?: Record<string, string>;
};
export function Workspace({ tool }: {
    tool: Tool;
}) {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const [decodedAt, setDecodedAt] = useState(0);
    const [header, setHeader] = useState("");
    const [claims, setClaims] = useState<Record<string, unknown>>({});
    const [pattern, setPattern] = useState("(tools)");
    const [flags, setFlags] = useState("gi");
    const [matches, setMatches] = useState<Match[]>([]);
    const [busy, setBusy] = useState(false);
    const [schedule, setSchedule] = useState("daily");
    const [minute, setMinute] = useState(0);
    const [hour, setHour] = useState(0);
    const [day, setDay] = useState(1);
    const [status, setStatus] = useState("");
    const [time, setTime] = useState("");
    const [headers, setHeaders] = useState("");
    const worker = useRef<Worker | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const slug = tool.slug;
    const json = slug === "json-formatter" || slug === "api-response-formatter";
    function stop() { worker.current?.terminate(); worker.current = null; if (timer.current)
        clearTimeout(timer.current); timer.current = null; setBusy(false); }
    function clear() { stop(); setDecodedAt(0); setInput(""); setOutput(""); setHeader(""); setClaims({}); setMessage(""); setError(false); setMatches([]); setPattern(""); setFlags("g"); setStatus(""); setTime(""); setHeaders(""); setSchedule("daily"); setMinute(0); setHour(0); setDay(1); }
    useEffect(() => { const reset = () => { setInput(""); setOutput(""); setHeader(""); setClaims({}); setMatches([]); setPattern(""); setHeaders(""); setStatus(""); setTime(""); setMessage(""); setError(false); setFlags("g"); setSchedule("daily"); setMinute(0); setHour(0); setDay(1); setDecodedAt(0); worker.current?.terminate(); if (timer.current)
        clearTimeout(timer.current); setBusy(false); }; window.addEventListener("pagehide", reset); window.addEventListener("pageshow", reset); return () => { window.removeEventListener("pagehide", reset); window.removeEventListener("pageshow", reset); worker.current?.terminate(); if (timer.current)
        clearTimeout(timer.current); }; }, []);
    function run(action: string) {
        stop();
        setError(false);
        setMessage("");
        setOutput("");
        setHeader("");
        setClaims({});
        setMatches([]);
        try {
            if (json) {
                if (slug === "api-response-formatter" && ((status && (!Number.isInteger(Number(status)) || Number(status) < 100 || Number(status) > 599)) || (time && (!Number.isFinite(Number(time)) || Number(time) < 0))))
                    throw new Error("Use an HTTP status from 100 to 599 and a nonnegative response time.");
                const result = formatJson(input, action === "Minify");
                setOutput(result);
                setMessage(action === "Validate" ? "JSON syntax is valid." : "JSON ready.");
            }
            else if (slug === "base64")
                setOutput(action === "Encode" ? encodeBase64(input) : decodeBase64(input));
            else if (slug === "jwt-decoder") {
                const result = decodeJwt(input);
                setDecodedAt(result.decodedAt);
                setOutput(result.payload);
                setHeader(result.header);
                setClaims(result.claims);
            }
            else if (slug === "cron-generator") {
                setOutput(input.trim());
                setMessage(inspectCron(input));
            }
            else if (slug === "regex-tester") {
                setBusy(true);
                const w = new Worker("/toolbox-regex-worker.js");
                worker.current = w;
                timer.current = setTimeout(() => { stop(); setError(true); setMessage("Pattern stopped after 750 ms. Simplify the pattern or shorten the text."); }, 750);
                w.onmessage = e => { const data = e.data; stop(); if (data.error) {
                    setError(true);
                    setMessage(data.error);
                }
                else {
                    setMatches(data.matches);
                    setOutput(JSON.stringify(data.matches, null, 2));
                    setMessage(`${data.matches.length} matches${data.capped ? " (stopped at the 1,000-match limit)" : ""}.`);
                } };
                w.onerror = () => { stop(); setError(true); setMessage("The regex worker could not run in this browser."); };
                w.postMessage({ pattern, flags, text: input });
            }
        }
        catch (e) {
            setError(true);
            setMessage(e instanceof Error ? e.message : "Unable to process this input.");
        }
    }
    async function copy(value: string) { try {
        await navigator.clipboard.writeText(value);
        setMessage("Copied to clipboard.");
        setError(false);
    }
    catch {
        setError(true);
        setMessage("Clipboard unavailable. Select the output and copy manually.");
    } }
    function sample() { clear(); setInput(tool.example); if (slug === "regex-tester") {
        setPattern("(tools)");
        setFlags("gi");
    } }
    const actions = json ? ["Format", "Minify", "Validate"] : slug === "base64" ? ["Encode", "Decode"] : slug === "jwt-decoder" ? ["Decode"] : slug === "cron-generator" ? ["Check expression"] : ["Test regex"];
    const pieces: React.ReactNode[] = [];
    if (slug === "regex-tester") {
        let end = 0;
        matches.forEach((m, i) => { pieces.push(input.slice(end, m.index)); pieces.push(<mark key={i}>{m.value || "|"}</mark>); end = m.index + m.value.length; });
        pieces.push(input.slice(end));
    }
    return <section className="tb-workspace" aria-label={`${tool.name} workspace`}>
 {slug === "jwt-decoder" && <p className="tb-warning">Decoding is not signature verification. Decoded claims do not prove authenticity. Do not paste real production credentials or sensitive tokens.</p>}
 {slug === "base64" && <p className="tb-muted">Base64 is encoding, not encryption. Anyone can decode it. This tool supports UTF-8 text, not binary files.</p>}
 {slug === "cron-generator" && <><p>Five-field Unix-style cron, evaluated in your scheduler timezone. No seconds, years, names, macros, Quartz extensions, or next-run predictions. Day-of-month and day-of-week restrictions use OR semantics. Calendar feasibility and daylight saving behavior depend on your scheduler.</p><div className="tb-cron-controls"><label>Schedule<select value={schedule} onChange={e => { setSchedule(e.target.value); setDay(1); }}>{["minute", "hourly", "daily", "weekly", "monthly"].map(s => <option key={s}>{s}</option>)}</select></label><label>Minute<input type="number" min="0" max="59" value={minute} onChange={e => setMinute(Number(e.target.value))}/></label><label>Hour (0-23)<input type="number" min="0" max="23" value={hour} onChange={e => setHour(Number(e.target.value))}/></label><label>{schedule === "weekly" ? "Weekday (0 = Sun)" : "Day of month"}<input type="number" min={schedule === "weekly" ? 0 : 1} max={schedule === "weekly" ? 6 : 31} value={day} onChange={e => setDay(Number(e.target.value))}/></label><button onClick={() => { const value = buildCron(schedule, minute, hour, day); setInput(value); try {
        setMessage(inspectCron(value));
        setOutput(value);
        setError(false);
    }
    catch {
        setOutput("");
        setError(true);
        setMessage("Choose values in the displayed ranges.");
    } }}>Generate</button></div><div className="tb-actions">{["*/5 * * * *", "0 0 * * *", "0 9 * * 1"].map(s => <button key={s} onClick={() => { setInput(s); setOutput(""); setMessage(""); }}>{s}</button>)}</div></>}
 {slug === "regex-tester" && <><div className="tb-editor-grid"><label>JavaScript pattern<input value={pattern} maxLength={2000} onChange={e => { stop(); setPattern(e.target.value); setMatches([]); setOutput(""); }} spellCheck={false}/></label><label>Flags (g, i, m, s, u, y, d, v)<input value={flags} onChange={e => { stop(); setFlags(e.target.value); setMatches([]); setOutput(""); }} spellCheck={false}/></label></div><p className="tb-muted">Runs only when you press Test. A dedicated worker stops after 750 ms. Maximum 1,000 matches. Browser support for newer flags varies.</p><button onClick={() => { setPattern("([A-Za-z]+)@([A-Za-z]+)\\.com"); setInput("demo@example.com"); setFlags("g"); setOutput(""); setMatches([]); }}>Load email capture example</button></>}
 {slug === "api-response-formatter" && <><p className="tb-muted">Paste a JSON body only. This tool does not execute cURL or make API requests. Metadata below is supplied by you, not measured.</p><div className="tb-cron-controls"><label>HTTP status (optional)<input type="number" min="100" max="599" value={status} onChange={e => setStatus(e.target.value)}/></label><label>Response time, ms (optional)<input type="number" min="0" value={time} onChange={e => setTime(e.target.value)}/></label><label>Headers (optional)<textarea rows={2} value={headers} onChange={e => setHeaders(e.target.value)} autoComplete="off" spellCheck={false}/></label></div></>}
 <div className="tb-editor-grid"><div><div className="tb-panel-heading"><label htmlFor="tool-input">{slug === "cron-generator" ? "Custom expression" : slug === "regex-tester" ? "Test text" : "Input"}</label><button onClick={sample}>Load example</button></div><textarea id="tool-input" rows={slug === "cron-generator" ? 3 : 14} value={input} onChange={e => { stop(); setInput(e.target.value); setOutput(""); setHeader(""); setClaims({}); setMatches([]); setMessage(""); }} autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={slug === "regex-tester" ? 100000 : 1000000}/><p className="tb-count">{input.length} characters | {input ? input.split("\n").length : 0} lines</p></div><div><div className="tb-panel-heading"><label htmlFor="tool-output">{slug === "jwt-decoder" ? "Decoded payload" : "Output"}</label><button onClick={() => copy(output)} disabled={!output}>Copy output</button></div><textarea id="tool-output" rows={slug === "cron-generator" ? 3 : 14} value={output} readOnly spellCheck={false}/><p className="tb-count">{output.length} characters | {output ? output.split("\n").length : 0} lines</p></div></div>
 <div className="tb-actions">{actions.map((a, i) => <button className={i === 0 ? "tb-primary" : ""} key={a} disabled={busy || !input.length} onClick={() => run(a)}>{busy ? "Testing..." : a}</button>)}{json && <button disabled={!output} onClick={() => { setInput(output); setOutput(""); setMessage(""); }}>Use output as input</button>}<button onClick={clear}>Clear / Reset</button></div><p className={error ? "tb-error" : "tb-status"} role={error ? "alert" : "status"}>{message}</p>
 {header && <><div className="tb-panel-heading"><h2>Decoded header</h2><button onClick={() => copy(header)}>Copy header</button></div><pre>{header}</pre><h2>Claims (unverified)</h2><dl className="tb-claims">{["iss", "sub", "aud", "iat", "exp", "nbf"].filter(k => k in claims).map(k => { const v = claims[k]; const date = typeof v === "number" && ["iat", "exp", "nbf"].includes(k) ? new Date(v * 1000) : null; return <div key={k}><dt>{k}</dt><dd>{JSON.stringify(v)}{date && Number.isFinite(date.getTime()) ? ` | ${date.toISOString()}${k === "exp" ? (date.getTime() < decodedAt ? " | expired according to this claim" : " | future expiration according to this claim") : ""}` : ""}</dd></div>; })}</dl></>}
 {slug === "cron-generator" && output && <dl className="tb-claims">{["Minute (0-59)", "Hour (0-23)", "Day of month (1-31)", "Month (1-12)", "Weekday (0-6, Sunday = 0)"].map((s, i) => <div key={s}><dt>{s}</dt><dd>{output.split(/\s+/)[i]}</dd></div>)}</dl>}
 {slug === "regex-tester" && matches.length > 0 && <><h2>Highlighted matches</h2><pre className="tb-highlight">{pieces}</pre><h2>Matches and capture groups</h2><p>Output above includes zero-based positions, matched values, numbered groups and named groups where present. Empty matches use a caret marker.</p></>}
 </section>;
}
