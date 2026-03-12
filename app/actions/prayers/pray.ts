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
    await prisma.prayerAction.create({
      data: {
        userId: session.user.id,
        prayerId,
      },
    });

    // Notify prayer author (if not anonymous and not self)
    const prayer = await prisma.prayer.findUnique({
      where: { id: prayerId },
      select: { authorId: true, isAnonymous: true },
    });

    if (prayer && prayer.authorId !== session.user.id) {
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
    // @@unique violation — already prayed
    if (err?.code === "P2002") {
      return { success: false, error: "Você já orou por este pedido.", code: 409 };
    }
    console.error("[prayAction]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }
}
