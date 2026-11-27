export const EARTH_RADIUS_KM = 6371.0088;
export function nearbyBounds(latitude: number, longitude: number, radiusKm: number) {
  const radians = radiusKm / EARTH_RADIUS_KM;
  const degrees = radians * 180 / Math.PI;
  const minLat = Math.max(-90, latitude - degrees), maxLat = Math.min(90, latitude + degrees);
  if (minLat === -90 || maxLat === 90) return { minLat, maxLat, longitudeRanges: [[-180, 180]] };
  const span = Math.asin(Math.min(1, Math.sin(radians) / Math.cos(latitude * Math.PI / 180))) * 180 / Math.PI;
  const minLng = longitude - span, maxLng = longitude + span;
  const longitudeRanges = minLng < -180 ? [[minLng + 360, 180], [-180, maxLng]] : maxLng > 180 ? [[minLng, 180], [-180, maxLng - 360]] : [[minLng, maxLng]];
  return { minLat, maxLat, longitudeRanges };
}
