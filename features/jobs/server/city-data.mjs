// Offline GeoNames city centres via cities.json (CC BY 4.0).
// Shared with the backfill CLI; import through city-search.ts from Next server code.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const normalize = value => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const aliases = new Map(Object.entries({ bangalore: "bengaluru", bombay: "mumbai", calcutta: "kolkata", "new york": "new york city", nyc: "new york city", "tel aviv": "tel aviv yafo" }));
const cityName = value => aliases.get(normalize(value)) ?? normalize(value);
let catalogue;
function data() {
  if (catalogue) return catalogue;
  const regions = new Map(require("cities.json/admin1").map(region => [region.code, region.name]));
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  const byName = new Map();
  const countries = new Map();
  const regionHints = new Map();
  const places = require("cities.json").map(city => {
    const region = regions.get(city.country + "." + city.admin1) ?? city.admin1;
    if (!countries.has(city.country)) countries.set(city.country, names.of(city.country) ?? city.country);
    const country = countries.get(city.country);
    const label = [city.name, region, country].filter(Boolean).join(", ");
    const regionKey = city.country + "." + city.admin1;
    if (!regionHints.has(regionKey)) {
      const hints = [city.country, country, region, city.admin1];
      if (city.country === "US") hints.push("USA", "United States of America");
      if (city.country === "GB") hints.push("UK", "Great Britain");
      regionHints.set(regionKey, hints.map(normalize));
    }
    const normalizedName = normalize(city.name);
    const place = { city: city.name, region, countryCode: city.country, latitude: Number(city.lat), longitude: Number(city.lng), label,
      cityKey: [city.country, city.admin1, normalizedName, city.lat, city.lng].join(":"),
      nameKey: aliases.get(normalizedName) ?? normalizedName, hints: regionHints.get(regionKey) };
    const existing = byName.get(place.nameKey) ?? [];
    existing.push(place); byName.set(place.nameKey, existing);
    return place;
  });
  const broadLabels = new Set([...countries.values(), ...regions.values()].map(normalize));
  catalogue = { places, byName, broadLabels };
  return catalogue;
}
function publicPlace(place) {
  const { city, region, countryCode, latitude, longitude, cityKey } = place;
  return { city, region, countryCode, latitude, longitude, cityKey };
}

/** Return only unambiguous city centres; never infer a location from a country/remote label. */
export function resolveJobLocations(job) {
  if (!job.location || job.workMode === "remote" || /\b(remote|worldwide|anywhere)\b/i.test(job.location)) return [];
  const { byName, broadLabels } = data();
  const found = new Map();
  for (const segment of job.location.split(/[•;|]/).slice(0, 20)) {
    const [name, ...context] = segment.split(",").map(value => value.trim()).filter(Boolean);
    if (!name) continue;
    if (!context.length && broadLabels.has(normalize(name)) && !["singapore", "hong kong", "macau", "monaco", "vatican city"].includes(normalize(name))) continue;
    let candidates = byName.get(cityName(name)) ?? [];
    if (job.countryCode) candidates = candidates.filter(place => place.countryCode === job.countryCode.toUpperCase());
    candidates = candidates.filter(place => context.every(part => place.hints.includes(normalize(part))));
    // Duplicate gazetteer records at exactly the same centre are equivalent.
    const unique = new Map(candidates.map(place => [[place.countryCode, place.latitude, place.longitude].join(":"), place]));
    if (unique.size !== 1) continue;
    const place = unique.values().next().value;
    found.set(place.cityKey, publicPlace(place));
  }
  return [...found.values()];
}

export function searchCities(query, limit = 8) {
  const [name, ...context] = query.split(",").map(value => normalize(value)).filter(Boolean);
  if (!name || name.length < 2) return [];
  const key = cityName(name);
  const matches = data().places.filter(place => place.nameKey.startsWith(key) && context.every(part => place.hints.some(hint => hint.startsWith(part))));
  matches.sort((a, b) => Number(b.nameKey === key) - Number(a.nameKey === key) || a.label.localeCompare(b.label));
  const seen = new Set();
  return matches.filter(place => { if (seen.has(place.label)) return false; seen.add(place.label); return true; }).slice(0, limit)
    .map(place => ({ ...publicPlace(place), label: place.label }));
}
