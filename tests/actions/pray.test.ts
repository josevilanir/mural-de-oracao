import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    prayer: { findUnique: vi.fn() },
    groupMember: { findUnique: vi.fn() },
    prayerAction: { create: vi.fn(), delete: vi.fn() },
    notification: { create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { prayAction, unprayAction } from "@/app/actions/prayers/pray";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { mockSession, mockPrayer } from "@/tests/__mocks__/factories";

// ---------------------------------------------------------------------------
// prayAction
// ---------------------------------------------------------------------------

describe("prayAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true } as never);
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const result = await prayAction("prayer-1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/logado/i);
  });

  it("returns error when rate limit exceeded", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: false,
      error: "Muitas requisições.",
    } as never);
    const result = await prayAction("prayer-1");
    expect(result.success).toBe(false);
  });

  it("returns error when prayer not found", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue(null as never);
    const result = await prayAction("prayer-1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não encontrado/i);
  });

  it("returns error when prayer is hidden", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue(
      mockPrayer({ isHidden: true }) as never,
    );
    const result = await prayAction("prayer-1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não encontrado/i);
  });

  it("returns access denied for GROUP_ONLY prayer without active membership", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue(
      mockPrayer({
        visibility: "GROUP_ONLY",
        groupId: "group-1",
        isHidden: false,
      }) as never,
    );
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      status: "PENDING",
    } as never);
    const result = await prayAction("prayer-1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/negado/i);
  });

  it("allows GROUP_ONLY prayer for active member", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue(
      mockPrayer({
        visibility: "GROUP_ONLY",
        groupId: "group-1",
        isHidden: false,
        authorId: "user-1",
      }) as never,
    );
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      status: "ACTIVE",
    } as never);
    vi.mocked(prisma.prayerAction.create).mockResolvedValue({} as never);
    vi.mocked(prisma.notification.create).mockResolvedValue({} as never);

    const result = await prayAction("prayer-1");
    expect(result.success).toBe(true);
  });

  it("creates prayerAction and notification when praying another user's prayer", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue(
      mockPrayer({ authorId: "user-1", isHidden: false }) as never,
    );
    vi.mocked(prisma.prayerAction.create).mockResolvedValue({} as never);
    vi.mocked(prisma.notification.create).mockResolvedValue({} as never);

    const result = await prayAction("prayer-1");
    expect(result.success).toBe(true);
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "PRAYER_CLICK",
          recipientId: "user-1",
        }),
      }),
    );
  });

  it("does NOT create notification when praying own prayer", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue(
      mockPrayer({ authorId: "user-1", isHidden: false }) as never,
    );
    vi.mocked(prisma.prayerAction.create).mockResolvedValue({} as never);

    const result = await prayAction("prayer-1");
    expect(result.success).toBe(true);
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });

  it("returns 409 error when user already prayed (P2002)", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue(
      mockPrayer({ authorId: "user-1", isHidden: false }) as never,
    );
    vi.mocked(prisma.prayerAction.create).mockRejectedValue({ code: "P2002" });

    const result = await prayAction("prayer-1");
    expect(result.success).toBe(false);
    expect((result as { code?: number }).code).toBe(409);
    expect(result.error).toMatch(/já orou/i);
  });
});

// ---------------------------------------------------------------------------
// unprayAction
// ---------------------------------------------------------------------------

describe("unprayAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const result = await unprayAction("prayer-1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/logado/i);
  });

  it("removes prayer action and returns success", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.prayerAction.delete).mockResolvedValue({} as never);

    const result = await unprayAction("prayer-1");
    expect(result.success).toBe(true);
    expect(prisma.prayerAction.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_prayerId: { userId: "user-1", prayerId: "prayer-1" } },
      }),
    );
  });

  it("returns error on unexpected database failure", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.prayerAction.delete).mockRejectedValue(
      new Error("db error"),
    );

    const result = await unprayAction("prayer-1");
    expect(result.success).toBe(false);
  });
});
