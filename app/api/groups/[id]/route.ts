import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sanitizePrayers } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  const userId = session?.user?.id;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20")),
  );
  const skip = (page - 1) * limit;

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      leader: { select: { id: true, name: true, image: true } },
      _count: { select: { members: true } },
    },
  });

  if (!group) {
    return NextResponse.json(
      { error: "Grupo não encontrado." },
      { status: 404 },
    );
  }

  // Check if user is an active member
  const membership = userId
    ? await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId, groupId: params.id } },
      })
    : null;

  const isMember = membership?.status === "ACTIVE";

  const members = await prisma.groupMember.findMany({
    where: { groupId: params.id, status: "ACTIVE", user: { isDeleted: false } },
    include: { user: { select: { id: true, name: true, image: true } } },
    skip,
    take: limit,
    orderBy: { joinedAt: "asc" },
  });

  // Prayers: members see all, non-members see only PUBLIC
  const prayers = await prisma.prayer.findMany({
    where: {
      groupId: params.id,
      isHidden: false,
      ...(isMember ? {} : { visibility: "PUBLIC" }),
    },
    include: {
      author: { select: { name: true, image: true } },
      _count: { select: { actions: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    group,
    members,
    prayers: sanitizePrayers(prayers),
    membership: membership ?? null,
    pagination: {
      page,
      limit,
      total: group._count.members,
    },
  });
}
