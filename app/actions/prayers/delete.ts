"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deletePrayer(prayerId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar logado." };
  }

  const prayer = await prisma.prayer.findUnique({
    where: { id: prayerId },
    select: { authorId: true },
  });

  if (!prayer) return { success: false, error: "Pedido não encontrado." };

  const isOwner = prayer.authorId === session.user.id;
  const isAdmin = (session.user as any).role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return { success: false, error: "Acesso negado." };
  }

  try {
    await prisma.prayer.delete({ where: { id: prayerId } });
    revalidatePath("/");
    revalidatePath("/meus-pedidos");
    revalidatePath(`/pedido/${prayerId}`);
    return { success: true };
  } catch (err) {
    console.error("[deletePrayer]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }
}
