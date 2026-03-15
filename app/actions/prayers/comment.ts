"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateCommentSchema } from "@/schemas/prayer";
import { revalidatePath } from "next/cache";

export async function createCommentAction(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar logado." };
  }

  const parsed = CreateCommentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { prayerId, text } = parsed.data;

  // Verify prayer exists and allows comments
  const prayer = await prisma.prayer.findUnique({
    where: { id: prayerId },
    select: { allowComments: true },
  });

  if (!prayer) return { success: false, error: "Pedido não encontrado." };
  if (!prayer.allowComments) return { success: false, error: "Comentários estão desativados para este pedido." };

  try {
    const comment = await prisma.comment.create({
      data: {
        text,
        prayerId,
        authorId: session.user.id,
      },
    });

    revalidatePath(`/pedido/${prayerId}`);
    return { success: true, comment };
  } catch (err) {
    console.error("[createCommentAction]", err);
    return { success: false, error: "Algo deu errado ao enviar o comentário." };
  }
}

export async function deleteCommentAction(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar logado." };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, prayerId: true },
  });

  if (!comment) return { success: false, error: "Comentário não encontrado." };

  const isAuthor = comment.authorId === session.user.id;
  const isAdmin = (session.user as any).role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    return { success: false, error: "Acesso negado." };
  }

  try {
    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath(`/pedido/${comment.prayerId}`);
    return { success: true };
  } catch (err) {
    console.error("[deleteCommentAction]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }
}
