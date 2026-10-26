import { describe, expect, it } from "vitest";
import { contentHash, date, jobDescriptionText, listQuery, plainText, providerConfig, safeUrl, scheduleSchema, slugFor } from "@/features/jobs/server/core";

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
  it("decodes escaped provider HTML into safe headings, paragraphs, and bullets", () => {
    const content = "&lt;div class=&quot;content-intro&quot;&gt;&lt;p&gt;&lt;strong&gt;Who we are&amp;nbsp;&lt;/strong&gt;&lt;/p&gt;&lt;p&gt;Build for &lt;a href=&quot;https://example.com&quot;&gt;customers&lt;/a&gt; &amp;amp; teams.&lt;br&gt;&lt;span style=&quot;color: rgb(255, 255, 255);&quot;&gt;.&lt;/span&gt;&lt;/p&gt;&lt;p&gt;&lt;em&gt;Daily work&lt;/em&gt;&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Lead operations&lt;/li&gt;&lt;li&gt;Improve quality&lt;/li&gt;&lt;/ul&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;/div&gt;";
    expect(jobDescriptionText(content)).toBe("## Who we are\n\nBuild for customers & teams.\n\n## Daily work\n\n- Lead operations\n- Improve quality");
  });
  it("keeps plain-text job paragraphs without HTML tags", () => {
    expect(jobDescriptionText("First paragraph.\n\nSecond paragraph.")).toBe("First paragraph.\n\nSecond paragraph.");
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
