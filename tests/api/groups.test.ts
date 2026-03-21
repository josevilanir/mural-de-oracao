import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that reference them
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    group: { findMany: vi.fn(), findUnique: vi.fn() },
    groupMember: { findUnique: vi.fn(), findMany: vi.fn() },
    prayer: { findMany: vi.fn() },
  },
}));
vi.mock("@/lib/utils", () => ({
  sanitizePrayers: vi.fn((p: unknown[]) => p),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks due to hoisting)
// ---------------------------------------------------------------------------

import { GET as getGroups } from "@/app/api/groups/route";
import { GET as getGroupById } from "@/app/api/groups/[id]/route";
import { GET as getPendingMembers } from "@/app/api/groups/[id]/pending-members/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockSession, mockGroup, mockGroupMember } from "@/tests/__mocks__/factories";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/groups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active groups", async () => {
    vi.mocked(prisma.group.findMany).mockResolvedValue([
      { ...mockGroup(), leader: { name: "Leader", image: null }, _count: { members: 5 } },
    ] as never);

    const response = await getGroups();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("group-1");
  });
});

describe("GET /api/groups/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(null as never);
  });

  it("returns 404 when group not found", async () => {
    vi.mocked(prisma.group.findUnique).mockResolvedValue(null);

    const req = new Request("http://localhost/api/groups/nonexistent");
    const response = await getGroupById(req, { params: { id: "nonexistent" } });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it("returns group data with prayers and members", async () => {
    const group = {
      ...mockGroup(),
      leader: { id: "user-1", name: "Leader", image: null },
      _count: { members: 2 },
    };
    vi.mocked(prisma.group.findUnique).mockResolvedValue(group as never);
    vi.mocked(prisma.groupMember.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.groupMember.findMany).mockResolvedValue([]);
    vi.mocked(prisma.prayer.findMany).mockResolvedValue([]);

    const req = new Request("http://localhost/api/groups/group-1");
    const response = await getGroupById(req, { params: { id: "group-1" } });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.group).toBeDefined();
    expect(body.members).toBeDefined();
    expect(body.prayers).toBeDefined();
    expect(body.membership).toBeDefined();
    expect(body.pagination).toBeDefined();
  });
});

describe("GET /api/groups/[id]/pending-members", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const req = new Request("http://localhost/api/groups/group-1/pending-members");
    const response = await getPendingMembers(req, { params: { id: "group-1" } });

    expect(response.status).toBe(401);
  });

  it("returns 404 when group not found", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.group.findUnique).mockResolvedValue(null);

    const req = new Request("http://localhost/api/groups/nonexistent/pending-members");
    const response = await getPendingMembers(req, { params: { id: "nonexistent" } });

    expect(response.status).toBe(404);
  });

  it("returns 403 when user is not leader", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-2" }) as never);
    vi.mocked(prisma.group.findUnique).mockResolvedValue(
      mockGroup({ leaderId: "user-1" }) as never
    );

    const req = new Request("http://localhost/api/groups/group-1/pending-members");
    const response = await getPendingMembers(req, { params: { id: "group-1" } });

    expect(response.status).toBe(403);
  });

  it("returns pending members for leader", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.group.findUnique).mockResolvedValue(
      mockGroup({ leaderId: "user-1" }) as never
    );
    vi.mocked(prisma.groupMember.findMany).mockResolvedValue([
      {
        ...mockGroupMember({ status: "PENDING" }),
        user: { id: "user-3", name: "Pending User", image: null, email: "pending@test.com" },
      },
    ] as never);

    const req = new Request("http://localhost/api/groups/group-1/pending-members");
    const response = await getPendingMembers(req, { params: { id: "group-1" } });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
  });
});
