import type {
  Prayer,
  User,
  Group,
  GroupMember,
  Comment,
  PrayerRemovalRequest,
} from "@prisma/client";

// ─────────────────────────────────────────────────────────
// Session factory
// ─────────────────────────────────────────────────────────

export function mockSession(overrides?: {
  id?: string;
  role?: "USER" | "ADMIN";
  email?: string;
  name?: string;
}) {
  return {
    user: {
      id: overrides?.id ?? "user-1",
      role: overrides?.role ?? "USER",
      email: overrides?.email ?? "test@test.com",
      name: overrides?.name ?? "Test User",
      image: null as string | null,
    },
  };
}

// ─────────────────────────────────────────────────────────
// Model factories
// ─────────────────────────────────────────────────────────

export function mockUser(overrides?: Partial<User>): User {
  const defaults: User = {
    id: "user-1",
    name: "Test User",
    email: "test@test.com",
    password: "hashed-pw",
    role: "USER",
    isDeleted: false,
    emailVerified: null,
    image: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };
  return { ...defaults, ...overrides };
}

export function mockPrayer(overrides?: Partial<Prayer>): Prayer {
  const defaults: Prayer = {
    id: "prayer-1",
    title: "Test Prayer",
    description: "Test prayer description text",
    category: "HEALTH",
    status: "ACTIVE",
    isAnonymous: false,
    allowComments: true,
    isHidden: false,
    testimony: null,
    verseReference: null,
    visibility: "PUBLIC",
    groupId: null,
    authorId: "user-1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };
  return { ...defaults, ...overrides };
}

export function mockGroup(overrides?: Partial<Group>): Group {
  const defaults: Group = {
    id: "group-1",
    name: "Test Group",
    description: null,
    image: null,
    status: "ACTIVE",
    leaderId: "user-1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };
  return { ...defaults, ...overrides };
}

export function mockGroupMember(overrides?: Partial<GroupMember>): GroupMember {
  const defaults: GroupMember = {
    id: "member-1",
    userId: "user-1",
    groupId: "group-1",
    status: "ACTIVE",
    joinedAt: new Date("2025-01-01"),
    createdAt: new Date("2025-01-01"),
  };
  return { ...defaults, ...overrides };
}

export function mockComment(overrides?: Partial<Comment>): Comment {
  const defaults: Comment = {
    id: "comment-1",
    text: "Test comment",
    authorId: "user-1",
    prayerId: "prayer-1",
    createdAt: new Date("2025-01-01"),
  };
  return { ...defaults, ...overrides };
}

export function mockPrayerRemovalRequest(
  overrides?: Partial<PrayerRemovalRequest>,
): PrayerRemovalRequest {
  const defaults: PrayerRemovalRequest = {
    id: "removal-1",
    prayerId: "prayer-1",
    groupId: "group-1",
    leaderId: "user-1",
    reason: "test reason",
    resolved: false,
    createdAt: new Date("2025-01-01"),
  };
  return { ...defaults, ...overrides };
}
