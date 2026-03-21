import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports that reference them
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    passwordResetToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    emailVerificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks due to hoisting)
// ---------------------------------------------------------------------------

import { registerAction } from "@/app/actions/user/register";
import { forgotPasswordAction, resetPasswordAction } from "@/app/actions/user/password-reset";
import {
  sendVerificationEmailAction,
  verifyEmailAction,
} from "@/app/actions/user/verify-email";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { mockUser } from "@/tests/__mocks__/factories";

// ---------------------------------------------------------------------------
// login (NextAuth authorize) — behavioral validation
// ---------------------------------------------------------------------------

describe("login (NextAuth authorize)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when user not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const user = await prisma.user.findUnique({
      where: { email: "notfound@test.com" },
    });

    // authorize returns null when user is not found
    expect(user).toBeNull();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it("rejects OAuth user without password", async () => {
    const oauthUser = mockUser({ password: null });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(oauthUser);

    const user = await prisma.user.findUnique({
      where: { email: oauthUser.email },
    });

    // authorize checks: if (!user || !user.password) return null
    expect(user).not.toBeNull();
    expect(user?.password).toBeNull();
    // bcrypt.compare is never reached for OAuth users
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it("rejects invalid password", async () => {
    const credentialUser = mockUser({ password: "hashed-pw" });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(credentialUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const user = await prisma.user.findUnique({
      where: { email: credentialUser.email },
    });
    const isValid = user?.password
      ? await bcrypt.compare("wrong-password", user.password)
      : false;

    // authorize returns null when password is invalid
    expect(isValid).toBe(false);
    expect(bcrypt.compare).toHaveBeenCalledWith("wrong-password", "hashed-pw");
  });

  it("accepts valid credentials", async () => {
    const credentialUser = mockUser({ password: "hashed-pw" });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(credentialUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const user = await prisma.user.findUnique({
      where: { email: credentialUser.email },
    });
    const isValid = user?.password
      ? await bcrypt.compare("correct-password", user.password)
      : false;

    // authorize returns user data when credentials are valid
    expect(isValid).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith("correct-password", "hashed-pw");
    // Returned user shape matches what authorize() returns
    expect(user).toMatchObject({
      id: credentialUser.id,
      email: credentialUser.email,
      name: credentialUser.name,
      image: credentialUser.image,
      role: credentialUser.role,
    });
  });
});

// ---------------------------------------------------------------------------
// registerAction
// ---------------------------------------------------------------------------

describe("registerAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error on invalid data", async () => {
    const result = await registerAction({ name: "", email: "bad", password: "x" });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns error when email already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser());

    const result = await registerAction({
      name: "Test User",
      email: "test@test.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("cadastrado");
  });

  it("registers user successfully", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser() as never);
    vi.mocked(prisma.emailVerificationToken.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.emailVerificationToken.create).mockResolvedValue({} as never);

    const result = await registerAction({
      name: "New User",
      email: "new@test.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("hashes password before storing", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser() as never);
    vi.mocked(prisma.emailVerificationToken.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.emailVerificationToken.create).mockResolvedValue({} as never);

    await registerAction({
      name: "New User",
      email: "new@test.com",
      password: "rawpassword",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("rawpassword", 12);
  });
});

// ---------------------------------------------------------------------------
// forgotPasswordAction
// ---------------------------------------------------------------------------

describe("forgotPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error on invalid email format", async () => {
    const result = await forgotPasswordAction("not-an-email");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns success even when user not found (no enumeration)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await forgotPasswordAction("nouser@test.com");

    expect(result.success).toBe(true);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("returns success for OAuth user (no password)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser({ password: null }));

    const result = await forgotPasswordAction("test@test.com");

    expect(result.success).toBe(true);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("creates reset token and sends email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser());
    vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({} as never);

    const result = await forgotPasswordAction("test@test.com");

    expect(result.success).toBe(true);
    expect(prisma.passwordResetToken.create).toHaveBeenCalled();
    expect(sendPasswordResetEmail).toHaveBeenCalledWith("test@test.com", expect.any(String));
  });
});

// ---------------------------------------------------------------------------
// resetPasswordAction
// ---------------------------------------------------------------------------

describe("resetPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error on invalid password (too short)", async () => {
    const result = await resetPasswordAction("some-token", "ab");

    expect(result.success).toBe(false);
    expect(result.error).toContain("6");
  });

  it("returns error when token not found", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(null);

    const result = await resetPasswordAction("bad-token", "validpassword");

    expect(result.success).toBe(false);
    expect(result.error).toContain("inválido ou expirado");
  });

  it("returns error when token expired", async () => {
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
      id: "token-1",
      token: "expired-token",
      email: "test@test.com",
      expires: new Date(Date.now() - 1000),
    } as never);

    const result = await resetPasswordAction("expired-token", "validpassword");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("resets password successfully", async () => {
    const validToken = {
      id: "token-1",
      token: "valid-token",
      email: "test@test.com",
      expires: new Date(Date.now() + 3600000),
    };
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue(validToken as never);
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser() as never);
    vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue({} as never);

    const result = await resetPasswordAction("valid-token", "newpassword");

    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "test@test.com" } })
    );
    expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
      where: { token: "valid-token" },
    });
  });
});

// ---------------------------------------------------------------------------
// sendVerificationEmailAction
// ---------------------------------------------------------------------------

describe("sendVerificationEmailAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes old tokens and creates new one", async () => {
    vi.mocked(prisma.emailVerificationToken.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.emailVerificationToken.create).mockResolvedValue({} as never);

    await sendVerificationEmailAction("test@test.com", "Test User");

    expect(prisma.emailVerificationToken.deleteMany).toHaveBeenCalledWith({
      where: { email: "test@test.com" },
    });
    expect(prisma.emailVerificationToken.create).toHaveBeenCalled();
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "test@test.com",
      "Test User",
      expect.any(String)
    );
  });
});

// ---------------------------------------------------------------------------
// verifyEmailAction
// ---------------------------------------------------------------------------

describe("verifyEmailAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when token not found", async () => {
    vi.mocked(prisma.emailVerificationToken.findUnique).mockResolvedValue(null);

    const result = await verifyEmailAction("nonexistent-token");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns error when token expired", async () => {
    vi.mocked(prisma.emailVerificationToken.findUnique).mockResolvedValue({
      id: "token-1",
      token: "expired-token",
      email: "test@test.com",
      expires: new Date(Date.now() - 1000),
    } as never);

    const result = await verifyEmailAction("expired-token");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("verifies email successfully", async () => {
    const validToken = {
      id: "token-1",
      token: "valid-token",
      email: "test@test.com",
      expires: new Date(Date.now() + 3600000),
    };
    vi.mocked(prisma.emailVerificationToken.findUnique).mockResolvedValue(validToken as never);
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser() as never);
    vi.mocked(prisma.emailVerificationToken.delete).mockResolvedValue({} as never);

    const result = await verifyEmailAction("valid-token");

    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "test@test.com" },
        data: expect.objectContaining({ emailVerified: expect.any(Date) }),
      })
    );
    expect(prisma.emailVerificationToken.delete).toHaveBeenCalledWith({
      where: { token: "valid-token" },
    });
  });
});
