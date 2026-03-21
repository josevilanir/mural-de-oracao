"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";

function requireAdmin(session: Session | null) {
  if (!session?.user?.id) throw new Error("Não autenticado.");
  if (session.user.role !== "ADMIN") throw new Error("Acesso negado.");
}

export async function toggleHiddenAction(prayerId: string, isHidden: boolean) {
  const session = await auth();
  try {
    requireAdmin(session);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Acesso negado.";
    return { success: false, error: message };
  }

  try {
    await prisma.prayer.update({
      where: { id: prayerId },
      data: { isHidden },
    });
    await prisma.auditLog.create({
      data: {
        action: isHidden ? "PRAYER_HIDDEN" : "PRAYER_APPROVED",
        actorId: session!.user!.id,
        targetId: prayerId,
      },
    });
    revalidatePath("/admin/prayers");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("[toggleHiddenAction]", err);
    return { success: false, error: "Algo deu errado." };
  }
}
