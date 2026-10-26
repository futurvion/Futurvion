import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { nearbyBounds } from "@/features/jobs/geo";
import { listQuery } from "@/features/jobs/server/core";
import { nearbyQuery } from "@/features/jobs/server/nearby-query";
import { jobListingFilter } from "@/features/jobs/server/queries";
import { resolveJobLocations, searchCities } from "@/features/jobs/server/city-search";

describe("nearby location evidence", () => {
  it("resolves each explicit city in a multi-location posting", () => {
    expect(resolveJobLocations({ location: "San Francisco, CA • New York, NY • United States", workMode: "unknown" }).map(point => point.city).sort()).toEqual(["New York City", "San Francisco"]);
  });
  it("supports aliases and accents with explicit countries", () => {
    expect(resolveJobLocations({ location: "Bangalore, India" })[0]?.city).toBe("Bengaluru");
    expect(resolveJobLocations({ location: "São Paulo, Brazil" })[0]?.countryCode).toBe("BR");
    expect(resolveJobLocations({ location: "London, England" })[0]?.countryCode).toBe("GB");
  });
  it("leaves ambiguous cities and remote/country-only labels unresolved", () => {
    for (const location of ["Santiago", "United States", "Georgia", "California", "New York", "Remote - Singapore", "Worldwide", "Europe, USA, Canada"])
      expect(resolveJobLocations({ location })).toEqual([]);
    expect(resolveJobLocations({ location: "London, England", workMode: "remote" })).toEqual([]);
  });
  it("returns distinguishable city choices without external services", () => {
    const choices = searchCities("London, UK");
    expect(choices[0]).toMatchObject({ city: "London", countryCode: "GB" });
    expect(choices.length).toBeLessThanOrEqual(8); expect(choices[0].label).toContain("England");
  });
  it("does not duplicate repeated source locations", () => {
    expect(resolveJobLocations({ location: "San Francisco, CA; San Francisco, CA" })).toHaveLength(1);
  });
});
describe("nearby filter and SQL bounds", () => {
  it("accepts equator/prime-meridian coordinates and defaults radius at query time", () => {
    expect(listQuery.parse({ nearLat: "0", nearLng: "0" })).toMatchObject({ nearLat: 0, nearLng: 0 });
  });
  it.each([{ nearLat: "51" }, { nearLng: "0" }, { nearLat: "91", nearLng: "0" }, { nearLat: "0", nearLng: "181" }, { nearLat: "NaN", nearLng: "0" }, { nearLat: "0", nearLng: "0", radiusKm: "251" }, { radiusKm: "25" }, { nearLat: "0", nearLng: "0", workMode: "remote" }])("rejects incomplete or invalid nearby filters: %j", input => {
    expect(listQuery.safeParse(input).success).toBe(false);
  });
  it("splits longitude bounds across the date line and permits all longitudes near a pole", () => {
    expect(nearbyBounds(0, 179.9, 50).longitudeRanges).toHaveLength(2);
    expect(nearbyBounds(89.9, 90, 50).longitudeRanges).toEqual([[-180, 180]]);
  });
  it("parameterizes origin/radius and filters before stable grouping/pagination", () => {
    const sql = nearbyQuery(jobListingFilter(listQuery.parse({})), 51.5074, -0.1278, 25);
    expect(sql.sql).not.toContain("51.5074"); expect(sql.values).toContain(51.5074);
    expect(sql.sql).toContain('PARTITION BY "listingKey"'); expect(sql.sql).toContain('"distanceKm" <= ?');
    expect(sql.sql).toContain('j."workMode" <> \'remote\''); expect(sql.sql).toContain('j."expiresAt" > NOW()');
  });
});
