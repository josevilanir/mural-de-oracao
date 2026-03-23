import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { update: vi.fn(), findUnique: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/sanitize", () => ({
  sanitizeUserInput: vi.fn((v: string) => v),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  updateProfileAction,
  updatePasswordAction,
} from "@/app/actions/user/profile";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { mockSession, mockUser } from "@/tests/__mocks__/factories";

// ---------------------------------------------------------------------------
// updateProfileAction
// ---------------------------------------------------------------------------

describe("updateProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const result = await updateProfileAction({ name: "Test User" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não autorizado/i);
  });

  it("returns error on invalid data (name too short)", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    const result = await updateProfileAction({ name: "A" });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/nome/i);
  });

  it("returns error on invalid image URL", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    const result = await updateProfileAction({
      name: "Valid Name",
      image: "not-a-url",
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/url/i);
  });

  it("updates profile successfully", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: "user-1",
      name: "Updated Name",
      image: null,
    } as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

    const result = await updateProfileAction({ name: "Updated Name" });
    expect(result.success).toBe(true);
    expect(result).toHaveProperty("user");
  });

  it("creates auditLog with USER_UPDATED on success", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: "user-1",
      name: "Updated Name",
      image: null,
    } as never);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never);

    await updateProfileAction({ name: "Updated Name" });
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "USER_UPDATED" }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// updatePasswordAction
// ---------------------------------------------------------------------------

describe("updatePasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const result = await updatePasswordAction({
      currentPassword: "old123",
      newPassword: "new456",
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/não autorizado/i);
  });

  it("returns error on invalid Zod data (empty currentPassword)", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession() as never);
    const result = await updatePasswordAction({
      currentPassword: "",
      newPassword: "new456",
    });
    expect(result.success).toBe(false);
  });

  it("returns error for social account without password", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      mockUser({ password: null }) as never,
    );
    const result = await updatePasswordAction({
      currentPassword: "old123",
      newPassword: "new456",
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/login social/i);
  });

  it("returns error when current password is wrong", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      mockUser({ password: "hashed-pw" }) as never,
    );
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const result = await updatePasswordAction({
      currentPassword: "wrong",
      newPassword: "new456",
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/senha atual/i);
  });

  it("returns error when new password equals current password", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      mockUser({ password: "hashed-pw" }) as never,
    );
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await updatePasswordAction({
      currentPassword: "same123",
      newPassword: "same123",
    });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/diferente/i);
  });

  it("updates password successfully", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession({ id: "user-1" }) as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      mockUser({ password: "hashed-pw" }) as never,
    );
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(bcrypt.hash).mockResolvedValue("new-hashed-pw" as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const result = await updatePasswordAction({
      currentPassword: "old123",
      newPassword: "new456",
    });
    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ password: "new-hashed-pw" }),
      }),
    );
  });
});
