import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { EARTH_RADIUS_KM, nearbyBounds } from "../geo";

export function nearbyQuery(filter: Prisma.Sql, latitude: number, longitude: number, radiusKm: number) {
  const bounds = nearbyBounds(latitude, longitude, radiusKm);
  const longitudeFilter = Prisma.join(bounds.longitudeRanges.map(([min, max]) => Prisma.sql`l.longitude BETWEEN ${min} AND ${max}`), " OR ");
  return Prisma.sql`
    WITH distances AS MATERIALIZED (
      SELECT j.id, j."listingKey", j."publishedAt", j."createdAt", j."lastVerifiedAt", l.city,
        2 * ${EARTH_RADIUS_KM}::double precision * asin(sqrt(LEAST(1.0, GREATEST(0.0,
          power(sin(radians(l.latitude - ${latitude}) / 2), 2) +
          cos(radians(${latitude})) * cos(radians(l.latitude)) *
          power(sin(radians(l.longitude - ${longitude}) / 2), 2)
        )))) AS "distanceKm"
      FROM "JobLocation" l JOIN "Job" j ON j.id = l."jobId"
        JOIN "JobProvider" p ON p.id = j."sourceProviderId"
      WHERE ${filter} AND j."workMode" <> 'remote'
        AND (j."expiresAt" IS NULL OR j."expiresAt" > NOW())
        AND l.latitude BETWEEN ${bounds.minLat} AND ${bounds.maxLat}
        AND (${longitudeFilter})
    ), ranked AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY "listingKey"
        ORDER BY "distanceKm", "lastVerifiedAt" DESC NULLS LAST,
          "publishedAt" DESC NULLS LAST, "createdAt" DESC, id) AS position
      FROM distances WHERE "distanceKm" <= ${radiusKm}
    )`;
}
