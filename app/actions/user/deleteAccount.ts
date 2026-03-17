"use server";

import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Você precisa estar logado." };
  }

  const userId = session.user.id;

  // RF04b — LGPD anonymization (NOT hard delete)
  const hash = crypto.createHash("sha256").update(userId).digest("hex").slice(0, 12);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: "Irmão(ã) em Cristo",
        email: `deleted_${hash}@anonymized.com`,
        image: null,
        password: null,
        isDeleted: true,
      },
    });

    // Remove group memberships and active sessions
    await prisma.groupMember.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });

    await signOut({ redirect: false });
    return { success: true };
  } catch (err) {
    console.error("[deleteAccountAction]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }
}
