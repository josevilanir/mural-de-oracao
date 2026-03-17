"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────
// 2.1 requestGroupCreation
// ─────────────────────────────────────────────────────────
const RequestGroupSchema = z.object({
  name: z.string().min(2, "Nome precisa ter ao menos 2 caracteres").max(80),
  description: z.string().max(500).optional(),
  image: z.string().regex(/^data:image\/(jpeg|jpg|png|webp|gif);base64,/, "Formato de imagem inválido").optional(),
});

export async function requestGroupCreation(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar logado." };
  }

  const parsed = RequestGroupSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, description, image } = parsed.data;

  const group = await prisma.group.create({
    data: {
      name,
      description: description || null,
      image: image || null,
      leaderId: session.user.id,
    },
  });

  revalidatePath("/grupos");
  return { success: true, group };
}

// ─────────────────────────────────────────────────────────
// deleteGroup — admin (qualquer) ou líder (o próprio grupo)
// ─────────────────────────────────────────────────────────
export async function deleteGroup(groupId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return { success: false, error: "Grupo não encontrado." };

  const isAdmin = session.user.role === "ADMIN";
  const isLeader = group.leaderId === session.user.id;

  if (!isAdmin && !isLeader) {
    return { success: false, error: "Sem permissão para apagar este grupo." };
  }

  await prisma.prayer.deleteMany({ where: { groupId } });
  await prisma.group.delete({ where: { id: groupId } });

  revalidatePath("/admin");
  revalidatePath("/grupos");
  return { success: true };
}

// ─────────────────────────────────────────────────────────
// 2.2 approveGroup — admin only
// ─────────────────────────────────────────────────────────
export async function approveGroup(groupId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };
  if (session.user.role !== "ADMIN") return { success: false, error: "Apenas admins." };

  const group = await prisma.group.update({
    where: { id: groupId },
    data: { status: "ACTIVE" },
  });

  // Adiciona o líder como membro ativo automaticamente
  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: group.leaderId, groupId: group.id } },
    create: { userId: group.leaderId, groupId: group.id, status: "ACTIVE", joinedAt: new Date() },
    update: { status: "ACTIVE", joinedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      type: "GROUP_CREATION_APPROVED",
      recipientId: group.leaderId,
      groupId: group.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/grupos");
  return { success: true };
}

// ─────────────────────────────────────────────────────────
// 2.3 rejectGroup — admin only
// ─────────────────────────────────────────────────────────
export async function rejectGroup(groupId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };
  if (session.user.role !== "ADMIN") return { success: false, error: "Apenas admins." };

  const group = await prisma.group.update({
    where: { id: groupId },
    data: { status: "ARCHIVED" },
  });

  await prisma.notification.create({
    data: {
      type: "GROUP_CREATION_REJECTED",
      recipientId: group.leaderId,
      groupId: group.id,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

// ─────────────────────────────────────────────────────────
// 2.4 requestJoinGroup
// ─────────────────────────────────────────────────────────
export async function requestJoinGroup(groupId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Você precisa estar logado." };

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group || group.status !== "ACTIVE") {
    return { success: false, error: "Grupo não encontrado ou inativo." };
  }

  try {
    await prisma.groupMember.create({
      data: {
        userId: session.user.id,
        groupId,
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return { success: false, error: "Você já solicitou participação." };
    }
    console.error("[requestJoinGroup]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }

  await prisma.notification.create({
    data: {
      type: "GROUP_JOIN_REQUEST",
      recipientId: group.leaderId,
      actorId: session.user.id,
      groupId,
    },
  });

  revalidatePath(`/grupos/${groupId}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────
// 2.5 approveJoinRequest — líder only
// ─────────────────────────────────────────────────────────
export async function approveJoinRequest(memberId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const member = await prisma.groupMember.findUnique({
    where: { id: memberId },
    include: { group: true },
  });
  if (!member) return { success: false, error: "Solicitação não encontrada." };
  if (member.group.leaderId !== session.user.id) {
    return { success: false, error: "Apenas o líder pode aprovar membros." };
  }

  await prisma.groupMember.update({
    where: { id: memberId },
    data: { status: "ACTIVE", joinedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      type: "GROUP_REQUEST_APPROVED",
      recipientId: member.userId,
      actorId: session.user.id,
      groupId: member.groupId,
    },
  });

  revalidatePath(`/grupos/${member.groupId}/gerenciar`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────
// 2.6 rejectJoinRequest — líder only
// ─────────────────────────────────────────────────────────
export async function rejectJoinRequest(memberId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const member = await prisma.groupMember.findUnique({
    where: { id: memberId },
    include: { group: true },
  });
  if (!member) return { success: false, error: "Solicitação não encontrada." };
  if (member.group.leaderId !== session.user.id) {
    return { success: false, error: "Apenas o líder pode rejeitar membros." };
  }

  await prisma.groupMember.update({
    where: { id: memberId },
    data: { status: "REJECTED" },
  });

  await prisma.notification.create({
    data: {
      type: "GROUP_REQUEST_REJECTED",
      recipientId: member.userId,
      actorId: session.user.id,
      groupId: member.groupId,
    },
  });

  revalidatePath(`/grupos/${member.groupId}/gerenciar`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────
// 2.7 requestPrayerRemoval — líder only
// ─────────────────────────────────────────────────────────
export async function requestPrayerRemoval(prayerId: string, groupId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return { success: false, error: "Grupo não encontrado." };
  if (group.leaderId !== session.user.id) {
    return { success: false, error: "Apenas o líder pode solicitar remoção." };
  }

  await prisma.$transaction([
    prisma.prayerRemovalRequest.create({
      data: { prayerId, groupId, leaderId: session.user.id, reason },
    }),
    prisma.prayer.update({
      where: { id: prayerId },
      data: { isHidden: true },
    }),
  ]);

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      type: "GROUP_PRAYER_REMOVAL_REQUEST" as const,
      recipientId: admin.id,
      actorId: session.user.id,
      prayerId,
      groupId,
    })),
  });

  revalidatePath(`/grupos/${groupId}`);
  revalidatePath("/admin");
  return { success: true };
}

// ─────────────────────────────────────────────────────────
// 2.8 resolvePrayerRemoval — admin only
// ─────────────────────────────────────────────────────────
export async function resolvePrayerRemoval(removalRequestId: string, approve: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };
  if (session.user.role !== "ADMIN") return { success: false, error: "Apenas admins." };

  const request = await prisma.prayerRemovalRequest.findUnique({
    where: { id: removalRequestId },
  });
  if (!request) return { success: false, error: "Solicitação não encontrada." };

  if (approve) {
    await prisma.$transaction([
      prisma.prayer.delete({ where: { id: request.prayerId } }),
      prisma.prayerRemovalRequest.update({
        where: { id: removalRequestId },
        data: { resolved: true },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.prayer.update({
        where: { id: request.prayerId },
        data: { isHidden: false },
      }),
      prisma.prayerRemovalRequest.update({
        where: { id: removalRequestId },
        data: { resolved: true },
      }),
    ]);
  }

  revalidatePath("/admin");
  return { success: true };
}
