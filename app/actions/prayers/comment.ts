"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateCommentSchema } from "@/schemas/prayer";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeUserInput } from "@/lib/sanitize";
import { sendCommentNotificationEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function createCommentAction(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar logado." };
  }

  const parsed = CreateCommentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const rl = await checkRateLimit("comment", session.user.id);
  if (!rl.success) return { success: false, error: rl.error };

  const { prayerId, text } = parsed.data;

  // Verify prayer exists and allows comments
  const prayer = await prisma.prayer.findUnique({
    where: { id: prayerId },
    select: {
      allowComments: true,
      authorId: true,
      isAnonymous: true,
      visibility: true,
      groupId: true,
      isHidden: true,
      title: true,
      author: { select: { name: true, email: true } },
    },
  });

  if (!prayer || prayer.isHidden)
    return { success: false, error: "Pedido não encontrado." };
  if (!prayer.allowComments)
    return {
      success: false,
      error: "Comentários estão desativados para este pedido.",
    };

  // GROUP_ONLY prayers require active membership
  if (prayer.visibility === "GROUP_ONLY" && prayer.groupId) {
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId: session.user.id, groupId: prayer.groupId },
      },
      select: { status: true },
    });
    if (membership?.status !== "ACTIVE") {
      return { success: false, error: "Acesso negado." };
    }
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        text: sanitizeUserInput(text),
        prayerId,
        authorId: session.user.id,
      },
    });

    // Notify prayer author (if not self)
    if (prayer.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "COMMENT_ADDED",
          recipientId: prayer.authorId,
          actorId: prayer.isAnonymous ? null : session.user.id,
          prayerId,
          commentId: comment.id,
        },
      });

      // Send email notification
      if (prayer.author.email) {
        const commenter = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true },
        });
        sendCommentNotificationEmail(
          prayer.author.email,
          prayer.author.name ?? "usuário",
          commenter?.name ?? "Alguém",
          prayer.title,
          prayerId,
        ).catch((err) =>
          console.error("[createCommentAction] email error:", err),
        );
      }
    }

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
  const isAdmin = session.user.role === "ADMIN";

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

// ─────────────────────────────────────────────────────────
// updateCommentAction — apenas autor ou admin
// ─────────────────────────────────────────────────────────
const UpdateCommentSchema = z.object({
  text: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(500, "Máximo 500 caracteres"),
});

export async function updateCommentAction(commentId: string, data: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, prayerId: true },
  });
  if (!comment) return { success: false, error: "Comentário não encontrado." };

  const isAuthor = comment.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isAuthor && !isAdmin) return { success: false, error: "Acesso negado." };

  const parsed = UpdateCommentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { text: sanitizeUserInput(parsed.data.text) },
    });

    await prisma.auditLog.create({
      data: {
        action: "COMMENT_UPDATED",
        actorId: session.user.id,
        targetId: commentId,
      },
    });

    revalidatePath(`/pedido/${comment.prayerId}`);
    return { success: true, comment: updated };
  } catch (err) {
    console.error("[updateCommentAction]", err);
    return { success: false, error: "Erro ao atualizar comentário." };
  }
}
