import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that reference them
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/r2", () => ({
  r2: {},
  R2_BUCKET: "test-bucket",
  R2_PUBLIC_URL: "https://cdn.test.com",
}));
vi.mock("@aws-sdk/s3-presigned-post", () => ({
  createPresignedPost: vi.fn().mockResolvedValue({
    url: "https://r2.test.com/upload",
    fields: { key: "test-key" },
  }),
}));
vi.mock("crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("test-uuid"),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks due to hoisting)
// ---------------------------------------------------------------------------

import { GET } from "@/app/api/upload/route";
import { auth } from "@/lib/auth";
import { mockSession } from "@/tests/__mocks__/factories";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const req = new Request(
      "http://localhost/api/upload?contentType=image/jpeg&contentLength=1000",
    );
    const response = await GET(req);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 for disallowed content type", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);

    const req = new Request(
      "http://localhost/api/upload?contentType=application/pdf&contentLength=1000",
    );
    const response = await GET(req);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("Tipo de arquivo");
  });

  it("returns 400 for file exceeding 5MB", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);

    const req = new Request(
      "http://localhost/api/upload?contentType=image/jpeg&contentLength=6000000",
    );
    const response = await GET(req);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 for missing contentLength", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);

    const req = new Request(
      "http://localhost/api/upload?contentType=image/jpeg",
    );
    const response = await GET(req);

    expect(response.status).toBe(400);
  });

  it("returns presigned URL for valid request", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);

    const req = new Request(
      "http://localhost/api/upload?contentType=image/jpeg&contentLength=1000",
    );
    const response = await GET(req);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.url).toBe("https://r2.test.com/upload");
    expect(body.fields).toBeDefined();
    expect(body.publicUrl).toContain("https://cdn.test.com");
  });
});
