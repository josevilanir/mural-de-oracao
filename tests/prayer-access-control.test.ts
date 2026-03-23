import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that reference them
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    prayer: { findMany: vi.fn() },
    prayerAction: { findMany: vi.fn() },
    groupMember: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks due to hoisting)
// ---------------------------------------------------------------------------

import { canAccessPrayer } from "@/lib/services/prayer-access";
import { fetchFeedAction } from "@/app/actions/prayers/feed";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { mockGroupMember } from "@/tests/__mocks__/factories";

// ---------------------------------------------------------------------------
// canAccessPrayer — service layer unit tests
// ---------------------------------------------------------------------------

describe("canAccessPrayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false for hidden prayers regardless of visibility", async () => {
    const result = await canAccessPrayer("user-1", {
      visibility: "PUBLIC",
      groupId: null,
      isHidden: true,
    });
    expect(result).toBe(false);
    expect(prisma.groupMember.findUnique).not.toHaveBeenCalled();
  });

  it("returns true for PUBLIC prayers without requiring a DB lookup", async () => {
    const result = await canAccessPrayer(undefined, {
      visibility: "PUBLIC",
      groupId: null,
      isHidden: false,
    });
    expect(result).toBe(true);
    expect(prisma.groupMember.findUnique).not.toHaveBeenCalled();
  });

  it("returns true for PUBLIC group prayers for any user", async () => {
    const result = await canAccessPrayer("user-1", {
      visibility: "PUBLIC",
      groupId: "group-1",
      isHidden: false,
    });
    expect(result).toBe(true);
    expect(prisma.groupMember.findUnique).not.toHaveBeenCalled();
  });

  it("returns false for GROUP_ONLY prayer when user is not authenticated", async () => {
    const result = await canAccessPrayer(undefined, {
      visibility: "GROUP_ONLY",
      groupId: "group-1",
      isHidden: false,
    });
    expect(result).toBe(false);
    expect(prisma.groupMember.findUnique).not.toHaveBeenCalled();
  });

  it("returns false for GROUP_ONLY prayer when prayer has no groupId", async () => {
    // Defensive: GROUP_ONLY without groupId should always deny access
    const result = await canAccessPrayer("user-1", {
      visibility: "GROUP_ONLY",
      groupId: null,
      isHidden: false,
    });
    expect(result).toBe(false);
  });

  it("returns false for GROUP_ONLY prayer when user is not a member", async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(null);

    const result = await canAccessPrayer("user-1", {
      visibility: "GROUP_ONLY",
      groupId: "group-1",
      isHidden: false,
    });

    expect(result).toBe(false);
    expect(prisma.groupMember.findUnique).toHaveBeenCalledWith({
      where: { userId_groupId: { userId: "user-1", groupId: "group-1" } },
      select: { status: true },
    });
  });

  it("returns false for GROUP_ONLY prayer when user membership is PENDING", async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(
      mockGroupMember({ status: "PENDING" }),
    );

    const result = await canAccessPrayer("user-1", {
      visibility: "GROUP_ONLY",
      groupId: "group-1",
      isHidden: false,
    });
    expect(result).toBe(false);
  });

  it("returns true for GROUP_ONLY prayer when user is an ACTIVE member", async () => {
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(
      mockGroupMember({ status: "ACTIVE" }),
    );

    const result = await canAccessPrayer("user-1", {
      visibility: "GROUP_ONLY",
      groupId: "group-1",
      isHidden: false,
    });
    expect(result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// fetchFeedAction — access-control integration tests
// ---------------------------------------------------------------------------

describe("fetchFeedAction — mural scope excludes GROUP_ONLY prayers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(null as Awaited<ReturnType<typeof auth>>);
    vi.mocked(prisma.prayer.findMany).mockResolvedValue([]);
    vi.mocked(prisma.prayerAction.findMany).mockResolvedValue([]);
  });

  it("does NOT filter by visibility when scope is 'mural' (all non-hidden prayers are shown)", async () => {
    await fetchFeedAction({ scope: "mural" });

    const call = vi.mocked(prisma.prayer.findMany).mock
      .calls[0][0] as Prisma.PrayerFindManyArgs;
    // Mural scope shows all non-hidden prayers — no visibility or OR filter
    expect(call.where?.visibility).toBeUndefined();
    expect(call.where?.OR).toBeUndefined();
    expect(call.where?.isHidden).toBe(false);
  });

  it("does NOT pass a visibility filter when scope is 'home' (uses OR clause instead)", async () => {
    await fetchFeedAction({ scope: "home" });

    const call = vi.mocked(prisma.prayer.findMany).mock
      .calls[0][0] as Prisma.PrayerFindManyArgs;
    // Home scope uses an OR clause, not a top-level visibility field
    expect(call.where?.visibility).toBeUndefined();
    expect(call.where?.OR).toBeDefined();
  });

  it("home scope OR clause excludes GROUP_ONLY group prayers", async () => {
    await fetchFeedAction({ scope: "home" });

    const call = vi.mocked(prisma.prayer.findMany).mock
      .calls[0][0] as Prisma.PrayerFindManyArgs;
    const orClause = call.where?.OR as Prisma.PrayerWhereInput[];
    // The OR clause should require groupId IS NULL *or* visibility PUBLIC
    // — it never includes a branch that passes GROUP_ONLY group prayers
    const hasGroupOnlyBranch = orClause.some(
      (branch) => branch.visibility === "GROUP_ONLY",
    );
    expect(hasGroupOnlyBranch).toBe(false);
  });
});
