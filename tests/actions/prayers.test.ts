import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that reference them
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    prayer: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), update: vi.fn() },
    groupMember: { findUnique: vi.fn() },
    comment: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
    notification: { create: vi.fn() },
    user: { findUnique: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/email", () => ({
  sendCommentNotificationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ---------------------------------------------------------------------------
// Imports (after mocks due to hoisting)
// ---------------------------------------------------------------------------

import { createPrayerAction } from "@/app/actions/prayers/create";
import { deletePrayer } from "@/app/actions/prayers/delete";
import { createCommentAction, deleteCommentAction } from "@/app/actions/prayers/comment";
import { resolveTestimonyAction } from "@/app/actions/prayers/resolve";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { mockSession, mockPrayer, mockComment } from "@/tests/__mocks__/factories";

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const validPrayerData = {
  title: "Test Prayer Title",
  description: "This is a test prayer description text",
  category: "HEALTH",
  isAnonymous: false,
  allowComments: true,
  visibility: "PUBLIC",
};

// ---------------------------------------------------------------------------
// createPrayerAction
// ---------------------------------------------------------------------------

describe("createPrayerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await createPrayerAction(validPrayerData);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/logado/i);
  });

  it("returns error on invalid data", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);

    const result = await createPrayerAction({});

    expect(result.success).toBe(false);
  });

  it("returns error for GROUP_ONLY without groupId", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);

    const result = await createPrayerAction({
      ...validPrayerData,
      visibility: "GROUP_ONLY",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/grupo/i);
  });

  it("returns error when user is not active group member", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      status: "PENDING",
    } as never);

    const result = await createPrayerAction({
      ...validPrayerData,
      groupId: "group-1",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/membro ativo/i);
  });

  it("creates prayer successfully", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.prayer.create).mockResolvedValue(mockPrayer() as never);

    const result = await createPrayerAction(validPrayerData);

    expect(result.success).toBe(true);
    expect(result).toHaveProperty("prayer");
  });
});

// ---------------------------------------------------------------------------
// deletePrayer
// ---------------------------------------------------------------------------

describe("deletePrayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await deletePrayer("prayer-1");

    expect(result.success).toBe(false);
  });

  it("returns error when prayer not found", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue(null as never);

    const result = await deletePrayer("prayer-1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não encontrado/i);
  });

  it("returns error when user is not owner or admin", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      authorId: "user-1",
    } as never);

    const result = await deletePrayer("prayer-1");

    expect(result.success).toBe(false);
  });

  it("allows owner to delete", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      authorId: "user-1",
    } as never);
    vi.mocked(prisma.prayer.delete).mockResolvedValue(mockPrayer() as never);

    const result = await deletePrayer("prayer-1");

    expect(result.success).toBe(true);
  });

  it("allows admin to delete", async () => {
    vi.mocked(auth).mockResolvedValue(
      mockSession({ id: "admin-1", role: "ADMIN" }) as never
    );
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      authorId: "user-1",
    } as never);
    vi.mocked(prisma.prayer.delete).mockResolvedValue(mockPrayer() as never);

    const result = await deletePrayer("prayer-1");

    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createCommentAction
// ---------------------------------------------------------------------------

describe("createCommentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await createCommentAction({ prayerId: "prayer-1", text: "Hi" });

    expect(result.success).toBe(false);
  });

  it("returns error on invalid data", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);

    const result = await createCommentAction({});

    expect(result.success).toBe(false);
  });

  it("returns error when prayer not found", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue(null as never);

    const result = await createCommentAction({ prayerId: "prayer-1", text: "Hello" });

    expect(result.success).toBe(false);
  });

  it("returns error when prayer is hidden", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      ...mockPrayer({ isHidden: true }),
      author: { name: "Author", email: "author@test.com" },
    } as never);

    const result = await createCommentAction({ prayerId: "prayer-1", text: "Hello" });

    expect(result.success).toBe(false);
  });

  it("returns error when comments disabled", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      ...mockPrayer({ allowComments: false }),
      author: { name: "Author", email: "author@test.com" },
    } as never);

    const result = await createCommentAction({ prayerId: "prayer-1", text: "Hello" });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/desativados/i);
  });

  it("returns error for GROUP_ONLY prayer when not active member", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      ...mockPrayer({ visibility: "GROUP_ONLY", groupId: "group-1" }),
      author: { name: "Author", email: "author@test.com" },
    } as never);
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      status: "PENDING",
    } as never);

    const result = await createCommentAction({ prayerId: "prayer-1", text: "Hello" });

    expect(result.success).toBe(false);
  });

  it("creates comment and sends notification for different author", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      ...mockPrayer({ authorId: "user-1" }),
      author: { name: "Author", email: "author@test.com" },
    } as never);
    vi.mocked(prisma.comment.create).mockResolvedValue(
      mockComment({ id: "comment-new" }) as never
    );
    vi.mocked(prisma.notification.create).mockResolvedValue({} as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

    const result = await createCommentAction({ prayerId: "prayer-1", text: "Hello" });

    expect(result.success).toBe(true);
    expect(prisma.notification.create).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// deleteCommentAction
// ---------------------------------------------------------------------------

describe("deleteCommentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await deleteCommentAction("comment-1");

    expect(result.success).toBe(false);
  });

  it("returns error when comment not found", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.comment.findUnique).mockResolvedValue(null as never);

    const result = await deleteCommentAction("comment-1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não encontrado/i);
  });

  it("returns error when user is not author or admin", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.comment.findUnique).mockResolvedValue({
      authorId: "user-1",
      prayerId: "prayer-1",
    } as never);

    const result = await deleteCommentAction("comment-1");

    expect(result.success).toBe(false);
  });

  it("allows author to delete", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.comment.findUnique).mockResolvedValue({
      authorId: "user-1",
      prayerId: "prayer-1",
    } as never);
    vi.mocked(prisma.comment.delete).mockResolvedValue(mockComment() as never);

    const result = await deleteCommentAction("comment-1");

    expect(result.success).toBe(true);
  });

  it("allows admin to delete", async () => {
    vi.mocked(auth).mockResolvedValue(
      mockSession({ id: "admin-1", role: "ADMIN" }) as never
    );
    vi.mocked(prisma.comment.findUnique).mockResolvedValue({
      authorId: "user-1",
      prayerId: "prayer-1",
    } as never);
    vi.mocked(prisma.comment.delete).mockResolvedValue(mockComment() as never);

    const result = await deleteCommentAction("comment-1");

    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// resolveTestimonyAction
// ---------------------------------------------------------------------------

describe("resolveTestimonyAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await resolveTestimonyAction({
      prayerId: "prayer-1",
      testimony: "God answered my prayer in a wonderful way this month",
    });

    expect(result.success).toBe(false);
  });

  it("returns error on invalid data", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);

    const result = await resolveTestimonyAction({});

    expect(result.success).toBe(false);
  });

  it("returns error when prayer not found", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue(null as never);

    const result = await resolveTestimonyAction({
      prayerId: "prayer-1",
      testimony: "God answered my prayer in a wonderful way this month",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não encontrado/i);
  });

  it("returns error when user is not the author", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      authorId: "user-1",
    } as never);

    const result = await resolveTestimonyAction({
      prayerId: "prayer-1",
      testimony: "God answered my prayer in a wonderful way this month",
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/autor/i);
  });

  it("resolves prayer with testimony", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.prayer.findUnique).mockResolvedValue({
      authorId: "user-1",
    } as never);
    vi.mocked(prisma.prayer.update).mockResolvedValue(
      mockPrayer({ status: "ANSWERED" }) as never
    );

    const result = await resolveTestimonyAction({
      prayerId: "prayer-1",
      testimony: "God answered my prayer in a wonderful way this month",
    });

    expect(result.success).toBe(true);
    expect(prisma.prayer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "ANSWERED" }),
      })
    );
  });
});
