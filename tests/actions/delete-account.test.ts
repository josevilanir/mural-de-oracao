import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { update: vi.fn() },
    groupMember: { deleteMany: vi.fn() },
    session: { deleteMany: vi.fn() },
    account: { deleteMany: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { deleteAccountAction } from "@/app/actions/user/deleteAccount";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/lib/auth";
import { mockSession } from "@/tests/__mocks__/factories";

// ---------------------------------------------------------------------------
// deleteAccountAction
// ---------------------------------------------------------------------------

describe("deleteAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const result = await deleteAccountAction();
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/logado/i);
  });

  it("anonymizes user data (LGPD soft-delete)", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);
    vi.mocked(prisma.groupMember.deleteMany).mockResolvedValue({
      count: 0,
    } as never);
    vi.mocked(prisma.session.deleteMany).mockResolvedValue({
      count: 0,
    } as never);
    vi.mocked(prisma.account.deleteMany).mockResolvedValue({
      count: 0,
    } as never);

    const result = await deleteAccountAction();
    expect(result.success).toBe(true);

    const updateCall = vi.mocked(prisma.user.update).mock.calls[0]?.[0];
    expect(updateCall?.data.name).toBe("Irmão(ã) em Cristo");
    expect(updateCall?.data.email).toMatch(/^deleted_.+@anonymized\.com$/);
    expect(updateCall?.data.isDeleted).toBe(true);
    expect(updateCall?.data.image).toBeNull();
    expect(updateCall?.data.password).toBeNull();
  });

  it("removes group memberships, sessions and accounts", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);
    vi.mocked(prisma.groupMember.deleteMany).mockResolvedValue({
      count: 2,
    } as never);
    vi.mocked(prisma.session.deleteMany).mockResolvedValue({
      count: 1,
    } as never);
    vi.mocked(prisma.account.deleteMany).mockResolvedValue({
      count: 1,
    } as never);

    await deleteAccountAction();

    expect(prisma.groupMember.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
    expect(prisma.account.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });

  it("calls signOut after anonymization", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);
    vi.mocked(prisma.groupMember.deleteMany).mockResolvedValue({
      count: 0,
    } as never);
    vi.mocked(prisma.session.deleteMany).mockResolvedValue({
      count: 0,
    } as never);
    vi.mocked(prisma.account.deleteMany).mockResolvedValue({
      count: 0,
    } as never);

    await deleteAccountAction();
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
  });

  it("returns error on database failure", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.user.update).mockRejectedValue(new Error("db error"));

    const result = await deleteAccountAction();
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/algo deu errado/i);
  });
});
