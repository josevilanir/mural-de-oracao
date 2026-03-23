import { prisma } from "@/lib/prisma";

interface PrayerAccessInfo {
  visibility: "PUBLIC" | "GROUP_ONLY";
  groupId: string | null;
  isHidden: boolean;
}

/**
 * Determines whether a user can access a specific prayer.
 *
 * - Hidden prayers are never accessible.
 * - PUBLIC prayers are accessible to everyone.
 * - GROUP_ONLY prayers require the viewer to be an active member of the prayer's group.
 */
export async function canAccessPrayer(
  userId: string | undefined,
  prayer: PrayerAccessInfo,
): Promise<boolean> {
  if (prayer.isHidden) return false;
  if (prayer.visibility === "PUBLIC") return true;

  // GROUP_ONLY: requires active group membership
  if (!prayer.groupId || !userId) return false;

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId: prayer.groupId } },
    select: { status: true },
  });

  return membership?.status === "ACTIVE";
}
