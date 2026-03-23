import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    group: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    groupMember: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    prayer: { update: vi.fn(), delete: vi.fn() },
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
// Imports
// ---------------------------------------------------------------------------

import {
  updateGroup,
  removeGroupMember,
  leaveGroup,
  requestPrayerRemoval,
  resolvePrayerRemoval,
} from "@/app/actions/groups/index";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { mockSession, mockGroup } from "@/tests/__mocks__/factories";

describe("Groups Extra Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // updateGroup
  // -------------------------------------------------------------------------
  describe("updateGroup", () => {
    it("returns error when not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null as any);
      const result = await updateGroup("g1", { name: "New Name" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Não autorizado.");
    });

    it("returns error when group not found", async () => {
      vi.mocked(auth).mockResolvedValue(mockSession() as any);
      vi.mocked(prisma.group.findUnique).mockResolvedValue(null as any);
      const result = await updateGroup("g1", { name: "New Name" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Grupo não encontrado.");
    });

    it("returns error when not leader or admin", async () => {
      vi.mocked(auth).mockResolvedValue(mockSession({ id: "u2" }) as any);
      vi.mocked(prisma.group.findUnique).mockResolvedValue(
        mockGroup({ leaderId: "u1" }) as any,
      );
      const result = await updateGroup("g1", { name: "New Name" });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Sem permissão/);
    });

    it("updates group successfully when leader", async () => {
      vi.mocked(auth).mockResolvedValue(mockSession({ id: "u1" }) as any);
      vi.mocked(prisma.group.findUnique).mockResolvedValue(
        mockGroup({ leaderId: "u1" }) as any,
      );
      vi.mocked(prisma.group.update).mockResolvedValue(
        mockGroup({ name: "New Name" }) as any,
      );

      const result = await updateGroup("g1", {
        name: "New Name",
        description: "Desc",
      });
      expect(result.success).toBe(true);
      expect(prisma.group.update).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // removeGroupMember
  // -------------------------------------------------------------------------
  describe("removeGroupMember", () => {
    it("returns error when member not found", async () => {
      vi.mocked(auth).mockResolvedValue(mockSession() as any);
      vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(null as any);
      const result = await removeGroupMember("m1");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Membro não encontrado.");
    });

    it("prevents removing the leader", async () => {
      vi.mocked(auth).mockResolvedValue(mockSession({ id: "u1" }) as any);
      vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
        userId: "u1",
        group: { leaderId: "u1" },
      } as any);
      const result = await removeGroupMember("m1");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/líder não pode ser removido/);
    });

    it("removes member successfully", async () => {
      vi.mocked(auth).mockResolvedValue(mockSession({ id: "u1" }) as any);
      vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
        id: "m1",
        userId: "u2",
        groupId: "g1",
        group: { leaderId: "u1" },
      } as any);
      vi.mocked(prisma.groupMember.delete).mockResolvedValue({} as any);

      const result = await removeGroupMember("m1");
      expect(result.success).toBe(true);
      expect(prisma.groupMember.delete).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // leaveGroup
  // -------------------------------------------------------------------------
  describe("leaveGroup", () => {
    it("prevents leader from leaving", async () => {
      vi.mocked(auth).mockResolvedValue(mockSession({ id: "u1" }) as any);
      vi.mocked(prisma.group.findUnique).mockResolvedValue(
        mockGroup({ leaderId: "u1" }) as any,
      );
      const result = await leaveGroup("g1");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/líder não pode sair/);
    });

    it("allows non-leader member to leave", async () => {
      vi.mocked(auth).mockResolvedValue(mockSession({ id: "u2" }) as any);
      vi.mocked(prisma.group.findUnique).mockResolvedValue(
        mockGroup({ leaderId: "u1" }) as any,
      );
      vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({
        id: "m1",
        status: "ACTIVE",
      } as any);
      vi.mocked(prisma.groupMember.delete).mockResolvedValue({} as any);

      const result = await leaveGroup("g1");
      expect(result.success).toBe(true);
      expect(prisma.groupMember.delete).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // requestPrayerRemoval
  // -------------------------------------------------------------------------
  describe("requestPrayerRemoval", () => {
    it("returns error if not leader", async () => {
      vi.mocked(auth).mockResolvedValue(mockSession({ id: "u2" }) as any);
      vi.mocked(prisma.group.findUnique).mockResolvedValue(
        mockGroup({ leaderId: "u1" }) as any,
      );
      const result = await requestPrayerRemoval("p1", "g1", "reason");
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Apenas o líder/);
    });

    it("creates removal request and hides prayer", async () => {
      vi.mocked(auth).mockResolvedValue(mockSession({ id: "u1" }) as any);
      vi.mocked(prisma.group.findUnique).mockResolvedValue(
        mockGroup({ leaderId: "u1" }) as any,
      );
      vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: "admin1" }] as any);
      vi.mocked(prisma.$transaction).mockResolvedValue([] as any);

      const result = await requestPrayerRemoval("p1", "g1", "reason");
      expect(result.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.notification.createMany).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // resolvePrayerRemoval
  // -------------------------------------------------------------------------
  describe("resolvePrayerRemoval", () => {
    it("returns error if not admin", async () => {
      vi.mocked(auth).mockResolvedValue(mockSession({ role: "USER" }) as any);
      const result = await resolvePrayerRemoval("req1", true);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Apenas admins.");
    });

    it("resolves and deletes prayer when approved", async () => {
      vi.mocked(auth).mockResolvedValue(
        mockSession({ role: "ADMIN", id: "a1" }) as any,
      );
      vi.mocked(prisma.prayerRemovalRequest.findUnique).mockResolvedValue({
        id: "req1",
        prayerId: "p1",
      } as any);
      vi.mocked(prisma.$transaction).mockResolvedValue([] as any);

      const result = await resolvePrayerRemoval("req1", true);
      expect(result.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("resolves and unhides prayer when rejected", async () => {
      vi.mocked(auth).mockResolvedValue(
        mockSession({ role: "ADMIN", id: "a1" }) as any,
      );
      vi.mocked(prisma.prayerRemovalRequest.findUnique).mockResolvedValue({
        id: "req1",
        prayerId: "p1",
      } as any);
      vi.mocked(prisma.$transaction).mockResolvedValue([] as any);

      const result = await resolvePrayerRemoval("req1", false);
      expect(result.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
