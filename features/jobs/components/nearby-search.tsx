"use client";
import { useEffect, useRef, useState } from "react";

export type NearbyOrigin = { latitude: number; longitude: number; label: string; radiusKm: number };
type City = { cityKey: string; label: string; latitude: number; longitude: number };
export function NearbySearch({ value, onChange }: { value: NearbyOrigin | null; onChange: (origin: NearbyOrigin | null) => void }) {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [radius, setRadius] = useState(25);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const request = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const cityInput = useRef<HTMLInputElement>(null);
  const distanceInput = useRef<HTMLSelectElement>(null);
  useEffect(() => () => { generation.current++; request.current?.abort(); }, []);

  function reset() {
    generation.current++; request.current?.abort();
    setCities([]); setQuery(""); setBusy(false); setError(""); setMessage("Nearby search cleared."); onChange(null); cityInput.current?.focus();
  }
  async function findCity() {
    if (query.trim().length < 2) { setError("Enter at least two characters of a city name."); return; }
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    const current = ++generation.current;
    setBusy(true); setError(""); setMessage(""); setCities([]);
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch("/api/jobs/locations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }), signal: controller.signal, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "City search is unavailable.");
      if (generation.current !== current) return;
      setCities(data.cities);
      setMessage(data.cities.length ? "Choose the correct city below." : "No city found. Include its country, or try another nearby city.");
    } catch {
      if (generation.current === current) setError("City search could not finish. Please try again.");
    } finally { clearTimeout(timeout); if (generation.current === current) setBusy(false); }
  }
  function useLocation() {
    request.current?.abort();
    const current = ++generation.current;
    setError(""); setMessage(""); setCities([]);
    if (!window.isSecureContext || !navigator.geolocation) { setError("Device location needs HTTPS and a supported browser. Choose a city instead."); setBusy(false); return; }
    setBusy(true); setMessage("Waiting for your browser’s location permission…");
    navigator.geolocation.getCurrentPosition(position => {
      if (generation.current !== current) return;
      // Coarsen the device location before it leaves the browser; never persist it.
      const latitude = Math.round(position.coords.latitude * 100) / 100;
      const longitude = Math.round(position.coords.longitude * 100) / 100;
      onChange({ latitude, longitude, label: "your approximate location", radiusKm: radius });
      setBusy(false); setMessage("Nearby location selected.");
    }, failure => {
      if (generation.current !== current) return;
      setBusy(false); setMessage("");
      setError(failure.code === 1 ? "Location permission was denied. Choose a city instead." : "Your location could not be found. Try again or choose a city.");
    }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 });
  }
  return <fieldset className="nearby-search">
    <legend>Nearby jobs</legend>
    <p>Choose a city or share your approximate location.</p>
    <label>City for nearby search<input ref={cityInput} value={query} onChange={event => {
      generation.current++; request.current?.abort(); setBusy(false); setCities([]); setError(""); setMessage("");
      setQuery(event.target.value); if (value) onChange(null);
    }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void findCity(); } }} placeholder="e.g. London, UK" maxLength={80} autoComplete="off"/></label>
    <div className="nearby-actions"><button type="button" onClick={() => void findCity()} disabled={busy}>Find city</button><button type="button" onClick={useLocation} disabled={busy}>Use my location</button></div>
    {cities.length > 0 && <ul className="nearby-city-options" aria-label="Choose a city">{cities.map(city => <li key={city.cityKey}><button type="button" onClick={() => {
      generation.current++; onChange({ latitude: city.latitude, longitude: city.longitude, label: city.label, radiusKm: radius });
      setCities([]); setMessage("Nearby location selected."); setQuery(city.label.slice(0, 80)); distanceInput.current?.focus();
    }}>{city.label}</button></li>)}</ul>}
    <label>Distance<select ref={distanceInput} disabled={busy} value={value?.radiusKm ?? radius} onChange={event => {
      const next = Number(event.target.value); setRadius(next); if (value) { onChange({ ...value, radiusKm: next }); setMessage(`Distance updated to ${next} km.`); }
    }}>{[10, 25, 50, 100, 250].map(km => <option value={km} key={km}>Within {km} km</option>)}</select></label>
    {value && <><p className="nearby-selected">Within {value.radiusKm} km of {value.label}. Closest jobs appear first.</p><input type="hidden" name="nearLat" value={value.latitude}/><input type="hidden" name="nearLng" value={value.longitude}/><input type="hidden" name="radiusKm" value={value.radiusKm}/></>}
    {(value || busy) && <button type="button" className="nearby-clear" onClick={reset}>Clear nearby search</button>}
    <p role="status" aria-live="polite" className="nearby-status">{busy ? message || "Finding cities…" : message}</p>
    {error && <p role="alert" className="nearby-error">{error}</p>}
    <p className="nearby-note">Distances are approximate, to job city centres. Remote-only and unresolved locations are excluded. Your location stays out of browser storage and URLs.</p>
    <p className="nearby-credit">City data: <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer">GeoNames</a> via <a href="https://github.com/lutangar/cities.json" target="_blank" rel="noopener noreferrer">cities.json</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p>
  </fieldset>;
}
