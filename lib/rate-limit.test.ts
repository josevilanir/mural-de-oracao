import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const limitMock = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: { fromEnv: vi.fn(() => ({})) },
}));

vi.mock("@upstash/ratelimit", () => {
  class Ratelimit {
    static slidingWindow = vi.fn((requests: number, window: string) => ({
      requests,
      window,
    }));
    limit = limitMock;
    constructor(_opts: unknown) {}
  }
  return { Ratelimit };
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    limitMock.mockReset();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a friendly error instead of throwing when the Upstash request fails (network/DNS error)", async () => {
    limitMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    const { checkRateLimit } = await import("./rate-limit");

    const result = await checkRateLimit("pray", "user-1");

    expect(result).toEqual({
      success: false,
      error:
        "Serviço temporariamente indisponível. Tente novamente em instantes.",
    });
  });

  it("returns the rate-limit-exceeded message when Upstash reports the limit was hit", async () => {
    limitMock.mockResolvedValueOnce({ success: false });
    const { checkRateLimit } = await import("./rate-limit");

    const result = await checkRateLimit("pray", "user-1");

    expect(result).toEqual({
      success: false,
      error: "Muitas requisições. Tente novamente em instantes.",
    });
  });

  it("returns success when the identifier is within the limit", async () => {
    limitMock.mockResolvedValueOnce({ success: true });
    const { checkRateLimit } = await import("./rate-limit");

    const result = await checkRateLimit("pray", "user-1");

    expect(result).toEqual({ success: true });
  });
});
