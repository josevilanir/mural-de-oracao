"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function requireAdmin(session: any) {
  if (!session?.user?.id) throw new Error("Não autenticado.");
  if (session.user.role !== "ADMIN") throw new Error("Acesso negado.");
}

export async function toggleHiddenAction(prayerId: string, isHidden: boolean) {
  const session = await auth();
  try {
    requireAdmin(session);
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  try {
    await prisma.prayer.update({
      where: { id: prayerId },
      data: { isHidden },
    });
    revalidatePath("/admin/prayers");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("[toggleHiddenAction]", err);
    return { success: false, error: "Algo deu errado." };
  }
}
