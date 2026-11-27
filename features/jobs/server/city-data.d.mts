export type PublicJobLocation = { city: string; region: string; countryCode: string; latitude: number; longitude: number; cityKey: string };
export function resolveJobLocations(job: { location?: string | null; workMode?: string; countryCode?: string | null }): PublicJobLocation[];
export function searchCities(query: string, limit?: number): (PublicJobLocation & { label: string })[];
