import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that reference them
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    notification: { findMany: vi.fn(), updateMany: vi.fn() },
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks due to hoisting)
// ---------------------------------------------------------------------------

import { GET, POST } from "@/app/api/notifications/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockSession } from "@/tests/__mocks__/factories";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns notifications for authenticated user", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.notification.findMany).mockResolvedValue([
      {
        id: "n1",
        type: "COMMENT_ADDED",
        createdAt: new Date(),
        isRead: false,
        recipientId: "user-1",
        actorId: null,
        prayerId: null,
        commentId: null,
        groupId: null,
        actor: null,
        prayer: null,
        group: null,
      },
    ] as never);

    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("n1");
  });
});

describe("POST /api/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const response = await POST();

    expect(response.status).toBe(401);
  });

  it("marks all as read", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 3 });

    const response = await POST();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ success: true });
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { recipientId: "user-1", isRead: false },
      data: { isRead: true },
    });
  });
});
