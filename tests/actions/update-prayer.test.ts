import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    prayer: { findUnique: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/sanitize", () => ({
  sanitizeUserInput: vi.fn((v: string) => v),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { updatePrayerAction } from "@/app/actions/prayers/update";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { mockSession, mockPrayer } from "@/tests/__mocks__/factories";

const validData = {
  title: "Updated Prayer Title",
  description:
    "This is an updated prayer description with more than twenty chars.",
  category: "FAMILY",
  isAnonymous: false,
  allowComments: true,
};

// ---------------------------------------------------------------------------
// updatePrayerAction
// ---------------------------------------------------------------------------

describe("updatePrayerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const result = await updatePrayerAction("prayer-1", validData);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não autorizado/i);
  });

  it("returns error when prayer not found", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue(null as never);
    const result = await updatePrayerAction("prayer-1", validData);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não encontrado/i);
  });

  it("returns error when user is not author or admin", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      authorId: "user-1",
      groupId: null,
    } as never);
    const result = await updatePrayerAction("prayer-1", validData);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/permissão/i);
  });

  it("returns error on invalid Zod data (title too short)", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      authorId: "user-1",
      groupId: null,
    } as never);
    const result = await updatePrayerAction("prayer-1", {
      ...validData,
      title: "hi",
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/título/i);
  });

  it("returns error on invalid Zod data (description too short)", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      authorId: "user-1",
      groupId: null,
    } as never);
    const result = await updatePrayerAction("prayer-1", {
      ...validData,
      description: "short",
    });
    expect(result.success).toBe(false);
  });

  it("allows author to update prayer", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      authorId: "user-1",
      groupId: null,
    } as never);
    vi.mocked(prisma.prayer.update).mockResolvedValue(mockPrayer() as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

    const result = await updatePrayerAction("prayer-1", validData);
    expect(result.success).toBe(true);
    expect(result).toHaveProperty("prayer");
  });

  it("allows admin to update any prayer", async () => {
    vi.mocked(auth).mockResolvedValue(
      mockSession({ id: "admin-1", role: "ADMIN" }) as never,
    );
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      authorId: "user-1",
      groupId: null,
    } as never);
    vi.mocked(prisma.prayer.update).mockResolvedValue(mockPrayer() as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

    const result = await updatePrayerAction("prayer-1", validData);
    expect(result.success).toBe(true);
  });

  it("creates an auditLog entry on successful update", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      authorId: "user-1",
      groupId: null,
    } as never);
    vi.mocked(prisma.prayer.update).mockResolvedValue(mockPrayer() as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

    await updatePrayerAction("prayer-1", validData);
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "PRAYER_UPDATED" }),
      }),
    );
  });
});
