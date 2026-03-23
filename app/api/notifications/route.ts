import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: {
      recipientId: session.user.id,
      OR: [{ prayerId: null }, { prayer: { isHidden: false } }],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      actor: { select: { name: true, image: true } },
      prayer: { select: { id: true, title: true } },
      group: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(notifications);
}

export async function POST() {
  // Marca todas as notificações do usuário como lidas
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { recipientId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
