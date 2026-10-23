import { describe, expect, it } from "vitest";
import { contentHash, date, listQuery, plainText, providerConfig, safeUrl, scheduleSchema, slugFor } from "@/features/jobs/server/core";

describe("jobs input and normalization", () => {
  it("rejects unsafe outbound URLs and provider identifiers", () => {
    expect(safeUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeUrl("data:text/html,a")).toBeUndefined();
    expect(safeUrl("https://user:secret@example.com/job")).toBeUndefined();
    expect(safeUrl("https://example.com/apply")).toBe("https://example.com/apply");
    expect(providerConfig.safeParse({ type: "greenhouse", board: "../private" }).success).toBe(false);
  });
  it("normalizes text and timestamps without rendering HTML", () => {
    expect(plainText("<p>Hello <b>world</b></p>")).toBe("Hello world");
    expect(date("1690000000000")?.getTime()).toBe(1690000000000);
  });
  it("uses source identity for stable distinct slugs and hashes", () => {
    const job = { externalJobId: "42", title: "Engineer", companyName: "Studio", workMode: "remote", applicationUrl: "https://example.com" };
    expect(slugFor(job, "lever")).toBe(slugFor(job, "lever"));
    expect(slugFor(job, "lever")).not.toBe(slugFor(job, "greenhouse"));
    expect(contentHash(job)).toBe(contentHash(job));
  });
  it("bounds public filters and schedule values", () => {
    expect(listQuery.parse({ page: "2" }).page).toBe(2);
    expect(listQuery.safeParse({ page: "0" }).success).toBe(false);
    expect(listQuery.safeParse({ salaryMin: "10", salaryMax: "5", salaryCurrency: "USD" }).success).toBe(false);
    expect(scheduleSchema.safeParse({ enabled: true, frequencyMinutes: 1, timezone: "UTC", batchSize: 100, maxConcurrency: 2, retryLimit: 2, retryDelaySeconds: 5, expireAfterDays: 14 }).success).toBe(false);
  });
});
