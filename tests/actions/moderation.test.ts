import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    prayer: { update: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { toggleHiddenAction } from "@/app/actions/admin/moderation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { mockSession } from "@/tests/__mocks__/factories";

// ---------------------------------------------------------------------------
// toggleHiddenAction
// ---------------------------------------------------------------------------

describe("toggleHiddenAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const result = await toggleHiddenAction("prayer-1", true);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/autenticado/i);
  });

  it("returns error when user role is USER (not admin)", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ role: "USER" }) as never);
    const result = await toggleHiddenAction("prayer-1", true);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/negado/i);
  });

  it("allows ADMIN to hide a prayer", async () => {
    vi.mocked(auth).mockResolvedValue(
      mockSession({ id: "admin-1", role: "ADMIN" }) as never,
    );
    vi.mocked(prisma.prayer.update).mockResolvedValue({} as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

    const result = await toggleHiddenAction("prayer-1", true);
    expect(result.success).toBe(true);
    expect(prisma.prayer.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isHidden: true } }),
    );
  });

  it("allows ADMIN to approve (un-hide) a prayer", async () => {
    vi.mocked(auth).mockResolvedValue(
      mockSession({ id: "admin-1", role: "ADMIN" }) as never,
    );
    vi.mocked(prisma.prayer.update).mockResolvedValue({} as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

    const result = await toggleHiddenAction("prayer-1", false);
    expect(result.success).toBe(true);
    expect(prisma.prayer.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isHidden: false } }),
    );
  });

  it("creates auditLog with PRAYER_HIDDEN when hiding", async () => {
    vi.mocked(auth).mockResolvedValue(
      mockSession({ id: "admin-1", role: "ADMIN" }) as never,
    );
    vi.mocked(prisma.prayer.update).mockResolvedValue({} as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

    await toggleHiddenAction("prayer-1", true);
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "PRAYER_HIDDEN" }),
      }),
    );
  });

  it("creates auditLog with PRAYER_APPROVED when approving", async () => {
    vi.mocked(auth).mockResolvedValue(
      mockSession({ id: "admin-1", role: "ADMIN" }) as never,
    );
    vi.mocked(prisma.prayer.update).mockResolvedValue({} as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

    await toggleHiddenAction("prayer-1", false);
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "PRAYER_APPROVED" }),
      }),
    );
  });

  it("returns error on database failure", async () => {
    vi.mocked(auth).mockResolvedValue(
      mockSession({ id: "admin-1", role: "ADMIN" }) as never,
    );
    vi.mocked(prisma.prayer.update).mockRejectedValue(new Error("db error"));

    const result = await toggleHiddenAction("prayer-1", true);
    expect(result.success).toBe(false);
  });
});
