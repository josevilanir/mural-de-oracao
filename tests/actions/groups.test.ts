import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that reference them
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    group: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    groupMember: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    prayer: { deleteMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
    notification: { create: vi.fn(), createMany: vi.fn() },
    user: { findMany: vi.fn() },
    prayerRemovalRequest: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn().mockImplementation((arr) => Promise.resolve(arr)),
  },
}));

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/email", () => ({
  sendGroupStatusEmail: vi.fn().mockResolvedValue(undefined),
  sendJoinRequestStatusEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ---------------------------------------------------------------------------
// Imports (after mocks due to hoisting)
// ---------------------------------------------------------------------------

import {
  requestGroupCreation,
  deleteGroup,
  approveGroup,
  rejectGroup,
  requestJoinGroup,
  approveJoinRequest,
  rejectJoinRequest,
} from "@/app/actions/groups/index";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  mockSession,
  mockGroup,
  mockGroupMember,
} from "@/tests/__mocks__/factories";

// ---------------------------------------------------------------------------
// requestGroupCreation
// ---------------------------------------------------------------------------

describe("requestGroupCreation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await requestGroupCreation({ name: "My Group" });

    expect(result.success).toBe(false);
  });

  it("returns error on invalid data", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);

    const result = await requestGroupCreation({ name: "" });

    expect(result.success).toBe(false);
  });

  it("creates group successfully", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.group.create).mockResolvedValue(mockGroup() as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

    const result = await requestGroupCreation({ name: "My Group" });

    expect(result.success).toBe(true);
    expect(result).toHaveProperty("group");
  });

  it("creates audit log entry", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.group.create).mockResolvedValue(mockGroup() as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

    await requestGroupCreation({ name: "My Group" });

    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "GROUP_CREATED" }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// deleteGroup
// ---------------------------------------------------------------------------

describe("deleteGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await deleteGroup("group-1");

    expect(result.success).toBe(false);
  });

  it("returns error when group not found", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.group.findUnique).mockResolvedValue(null as never);

    const result = await deleteGroup("group-1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não encontrado/i);
  });

  it("returns error when not admin or leader", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.group.findUnique).mockResolvedValue(
      mockGroup({ leaderId: "user-1" }) as never,
    );

    const result = await deleteGroup("group-1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/permissão/i);
  });

  it("allows leader to delete", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.group.findUnique).mockResolvedValue(
      mockGroup({ leaderId: "user-1" }) as never,
    );
    vi.mocked(prisma.$transaction).mockResolvedValue([] as never);

    const result = await deleteGroup("group-1");

    expect(result.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("allows admin to delete", async () => {
    vi.mocked(auth).mockResolvedValue(
      mockSession({ id: "admin-1", role: "ADMIN" }) as never,
    );
    vi.mocked(prisma.group.findUnique).mockResolvedValue(
      mockGroup({ leaderId: "user-1" }) as never,
    );
    vi.mocked(prisma.$transaction).mockResolvedValue([] as never);

    const result = await deleteGroup("group-1");

    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// approveGroup
// ---------------------------------------------------------------------------

describe("approveGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await approveGroup("group-1");

    expect(result.success).toBe(false);
  });

  it("returns error when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ role: "USER" }) as never);

    const result = await approveGroup("group-1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/admin/i);
  });

  it("approves group and notifies leader", async () => {
    vi.mocked(auth).mockResolvedValue(
      mockSession({ id: "admin-1", role: "ADMIN" }) as never,
    );
    vi.mocked(prisma.group.update).mockResolvedValue({
      ...mockGroup(),
      leader: { name: "Leader", email: "leader@test.com" },
    } as ReturnType<typeof mockGroup> & {
      leader: { name: string; email: string };
    } as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);
    vi.mocked(prisma.groupMember.upsert).mockResolvedValue(
      mockGroupMember() as never,
    );
    vi.mocked(prisma.notification.create).mockResolvedValue({} as never);

    const result = await approveGroup("group-1");

    expect(result.success).toBe(true);
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "GROUP_APPROVED" }),
      }),
    );
    expect(prisma.notification.create).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// rejectGroup
// ---------------------------------------------------------------------------

describe("rejectGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ role: "USER" }) as never);

    const result = await rejectGroup("group-1");

    expect(result.success).toBe(false);
  });

  it("rejects group and notifies leader", async () => {
    vi.mocked(auth).mockResolvedValue(
      mockSession({ id: "admin-1", role: "ADMIN" }) as never,
    );
    vi.mocked(prisma.group.update).mockResolvedValue({
      ...mockGroup({ status: "ARCHIVED" }),
      leader: { name: "Leader", email: "leader@test.com" },
    } as ReturnType<typeof mockGroup> & {
      leader: { name: string; email: string };
    } as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);
    vi.mocked(prisma.notification.create).mockResolvedValue({} as never);

    const result = await rejectGroup("group-1");

    expect(result.success).toBe(true);
    expect(prisma.group.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "ARCHIVED" }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "GROUP_REJECTED" }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// requestJoinGroup
// ---------------------------------------------------------------------------

describe("requestJoinGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await requestJoinGroup("group-1");

    expect(result.success).toBe(false);
  });

  it("returns error when group not found or not active", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.group.findUnique).mockResolvedValue(
      mockGroup({ status: "PENDING" }) as never,
    );

    const result = await requestJoinGroup("group-1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não encontrado|inativo/i);
  });

  it("creates join request", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.group.findUnique).mockResolvedValue(
      mockGroup({ status: "ACTIVE" }) as never,
    );
    vi.mocked(prisma.groupMember.create).mockResolvedValue(
      mockGroupMember() as never,
    );
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);
    vi.mocked(prisma.notification.create).mockResolvedValue({} as never);

    const result = await requestJoinGroup("group-1");

    expect(result.success).toBe(true);
    expect(prisma.groupMember.create).toHaveBeenCalled();
  });

  it("returns error on duplicate request", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    vi.mocked(prisma.group.findUnique).mockResolvedValue(
      mockGroup({ status: "ACTIVE" }) as never,
    );
    vi.mocked(prisma.groupMember.create).mockRejectedValue({
      code: "P2002",
    } as never);

    const result = await requestJoinGroup("group-1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/já solicitou/i);
  });
});

// ---------------------------------------------------------------------------
// approveJoinRequest
// ---------------------------------------------------------------------------

describe("approveJoinRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not leader", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      ...mockGroupMember(),
      group: mockGroup({ leaderId: "user-1" }),
      user: { name: "Member", email: "member@test.com" },
    } as never);

    const result = await approveJoinRequest("member-1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/líder/i);
  });

  it("approves member and notifies", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      ...mockGroupMember(),
      group: mockGroup({ leaderId: "user-1" }),
      user: { name: "Member", email: "member@test.com" },
    } as never);
    vi.mocked(prisma.groupMember.update).mockResolvedValue(
      mockGroupMember({ status: "ACTIVE" }) as never,
    );
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);
    vi.mocked(prisma.notification.create).mockResolvedValue({} as never);

    const result = await approveJoinRequest("member-1");

    expect(result.success).toBe(true);
    expect(prisma.groupMember.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "ACTIVE" }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// rejectJoinRequest
// ---------------------------------------------------------------------------

describe("rejectJoinRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not leader", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      ...mockGroupMember(),
      group: mockGroup({ leaderId: "user-1" }),
      user: { name: "Member", email: "member@test.com" },
    } as never);

    const result = await rejectJoinRequest("member-1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/líder/i);
  });

  it("rejects member and notifies", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
      ...mockGroupMember(),
      group: mockGroup({ leaderId: "user-1" }),
      user: { name: "Member", email: "member@test.com" },
    } as never);
    vi.mocked(prisma.groupMember.update).mockResolvedValue(
      mockGroupMember({ status: "REJECTED" }) as never,
    );
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);
    vi.mocked(prisma.notification.create).mockResolvedValue({} as never);

    const result = await rejectJoinRequest("member-1");

    expect(result.success).toBe(true);
    expect(prisma.groupMember.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "REJECTED" }),
      }),
    );
  });
});
