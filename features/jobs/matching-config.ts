// Shared limits keep browser validation and server enforcement aligned.
export const MATCH_CONFIG = { maxFileBytes: 2 * 1024 * 1024, maxTextCharacters: 100_000, maxPages: 30,
  parseTimeoutMs: 12_000, uploadTimeoutMs: 8_000, shortlistSize: 100, pageSize: 20, minimumScore: 30, rateLimitPerHour: 5 } as const;
export const MATCH_WEIGHTS = { requiredSkills: 30, preferredSkills: 10, title: 20, experience: 20, description: 15, qualifications: 5 } as const;
