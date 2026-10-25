import { describe, expect, it, vi } from "vitest";
vi.mock("@/features/jobs/server/queries", () => ({ getJob: vi.fn() }));
import { getJob } from "@/features/jobs/server/queries";
import { GET } from "@/app/api/jobs/[slug]/route";

describe("public job detail privacy", () => {
  it("retains old deep links without disclosing internal grouping or source identities", async () => {
    vi.mocked(getJob).mockResolvedValue({ id: "internal", sourceProviderId: "provider", externalJobId: "source", contentHash: "hash", listingKey: "group", slug: "older-source-posting", title: "Engineer" } as never);
    const response = await GET(new Request("https://example.com/api/jobs/older-source-posting"), { params: Promise.resolve({ slug: "older-source-posting" }) });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ slug: "older-source-posting", title: "Engineer" });
  });
});
