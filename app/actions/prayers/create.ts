"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreatePrayerSchema } from "@/schemas/prayer";
import { revalidatePath } from "next/cache";

export async function createPrayerAction(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar logado." };
  }

  const parsed = CreatePrayerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    const prayer = await prisma.prayer.create({
      data: {
        ...parsed.data,
        verseReference: parsed.data.verseReference || null,
        authorId: session.user.id,
      },
    });

    revalidatePath("/");
    return { success: true, prayer };
  } catch (err) {
    console.error("[createPrayerAction]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }
}
