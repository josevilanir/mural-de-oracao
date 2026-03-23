"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreatePrayerSchema } from "@/schemas/prayer";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizePrayer } from "@/lib/utils";
import { sanitizeUserInput } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";

export async function createPrayerAction(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar logado." };
  }

  const rl = await checkRateLimit("prayer", session.user.id);
  if (!rl.success) return { success: false, error: rl.error };

  const parsed = CreatePrayerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { visibility, groupId } = parsed.data;

  if (visibility === "GROUP_ONLY" && !groupId) {
    return {
      success: false,
      error: "Pedido privado precisa estar vinculado a um grupo.",
    };
  }

  if (groupId) {
    const membership = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: session.user.id, groupId } },
    });
    if (membership?.status !== "ACTIVE") {
      return {
        success: false,
        error: "Você precisa ser membro ativo do grupo para postar nele.",
      };
    }
  }

  try {
    const prayer = await prisma.prayer.create({
      data: {
        ...parsed.data,
        title: sanitizeUserInput(parsed.data.title),
        description: sanitizeUserInput(parsed.data.description),
        verseReference: parsed.data.verseReference
          ? sanitizeUserInput(parsed.data.verseReference)
          : null,
        groupId: groupId || null,
        authorId: session.user.id,
      },
    });

    revalidatePath("/");
    if (groupId) revalidatePath(`/grupos/${groupId}`);
    return { success: true, prayer: sanitizePrayer(prayer) };
  } catch (err) {
    console.error("[createPrayerAction]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }
}
