"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function prayAction(prayerId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar logado." };
  }

  try {
    // Fetch prayer first to enforce visibility rules
    const prayer = await prisma.prayer.findUnique({
      where: { id: prayerId },
      select: { authorId: true, isAnonymous: true, visibility: true, groupId: true, isHidden: true },
    });

    if (!prayer || prayer.isHidden) {
      return { success: false, error: "Pedido não encontrado." };
    }

    // GROUP_ONLY prayers require active membership
    if (prayer.visibility === "GROUP_ONLY" && prayer.groupId) {
      const membership = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: session.user.id, groupId: prayer.groupId } },
        select: { status: true },
      });
      if (membership?.status !== "ACTIVE") {
        return { success: false, error: "Acesso negado." };
      }
    }

    await prisma.prayerAction.create({
      data: {
        userId: session.user.id,
        prayerId,
      },
    });

    if (prayer.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "PRAYER_CLICK",
          recipientId: prayer.authorId,
          actorId: prayer.isAnonymous ? null : session.user.id,
          prayerId,
        },
      });
    }

    revalidatePath("/");
    revalidatePath(`/pedido/${prayerId}`);
    return { success: true };
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { success: false, error: "Você já orou por este pedido.", code: 409 };
    }
    console.error("[prayAction]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }
}

export async function unprayAction(prayerId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar logado." };
  }

  try {
    await prisma.prayerAction.delete({
      where: { userId_prayerId: { userId: session.user.id, prayerId } },
    });

    revalidatePath("/");
    revalidatePath(`/pedido/${prayerId}`);
    return { success: true };
  } catch (err) {
    console.error("[unprayAction]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }
}
