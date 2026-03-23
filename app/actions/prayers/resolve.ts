"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResolveTestimonySchema } from "@/schemas/prayer";
import { sanitizeUserInput } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";

export async function resolveTestimonyAction(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar logado." };
  }

  const parsed = ResolveTestimonySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { prayerId, testimony } = parsed.data;

  // Only the owner can mark as answered
  const prayer = await prisma.prayer.findUnique({
    where: { id: prayerId },
    select: { authorId: true },
  });

  if (!prayer) return { success: false, error: "Pedido não encontrado." };
  if (prayer.authorId !== session.user.id) {
    return {
      success: false,
      error: "Apenas o autor pode marcar como respondido.",
    };
  }

  try {
    await prisma.prayer.update({
      where: { id: prayerId },
      data: {
        status: "ANSWERED",
        testimony: testimony ? sanitizeUserInput(testimony) : testimony,
      },
    });

    revalidatePath("/");
    revalidatePath(`/pedido/${prayerId}`);
    revalidatePath("/meus-pedidos");
    return { success: true };
  } catch (err) {
    console.error("[resolveTestimonyAction]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }
}
