"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeUserInput } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdatePrayerSchema = z.object({
  title: z
    .string()
    .min(5, "O título precisa ter entre 5 e 100 caracteres")
    .max(100, "O título precisa ter entre 5 e 100 caracteres"),
  description: z
    .string()
    .min(20, "Conte um pouco mais — mínimo 20 caracteres")
    .max(1000, "Máximo 1000 caracteres"),
  category: z.enum(
    [
      "HEALTH",
      "FAMILY",
      "FINANCES",
      "RELATIONSHIPS",
      "WORK_STUDY",
      "HOLINESS",
    ] as const,
    { error: "Por favor, selecione uma categoria" },
  ),
  isAnonymous: z.boolean(),
  allowComments: z.boolean(),
});

export async function updatePrayerAction(prayerId: string, data: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const prayer = await prisma.prayer.findUnique({
    where: { id: prayerId },
    select: { authorId: true, groupId: true },
  });
  if (!prayer) return { success: false, error: "Pedido não encontrado." };

  const isAdmin = session.user.role === "ADMIN";
  const isAuthor = prayer.authorId === session.user.id;
  if (!isAuthor && !isAdmin) {
    return { success: false, error: "Sem permissão para editar este pedido." };
  }

  const parsed = UpdatePrayerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { title, description, category, isAnonymous, allowComments } =
    parsed.data;

  try {
    const updated = await prisma.prayer.update({
      where: { id: prayerId },
      data: {
        title: sanitizeUserInput(title),
        description: sanitizeUserInput(description),
        category,
        isAnonymous,
        allowComments,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "PRAYER_UPDATED",
        actorId: session.user.id,
        targetId: prayerId,
      },
    });

    revalidatePath(`/pedido/${prayerId}`);
    revalidatePath("/meus-pedidos");
    if (prayer.groupId) revalidatePath(`/grupos/${prayer.groupId}`);
    revalidatePath("/");
    return { success: true, prayer: updated };
  } catch (err) {
    console.error("[updatePrayerAction]", err);
    return { success: false, error: "Erro ao atualizar pedido." };
  }
}
