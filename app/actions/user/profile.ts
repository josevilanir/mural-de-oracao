"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeUserInput } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

// ─────────────────────────────────────────────────────────
// updateProfileAction — atualiza name e image do usuário autenticado
// ─────────────────────────────────────────────────────────
const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Nome precisa ter ao menos 2 caracteres").max(80),
  image: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
});

export async function updateProfileAction(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const parsed = UpdateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { name, image } = parsed.data;

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: sanitizeUserInput(name),
        image: image || null,
      },
      select: { id: true, name: true, image: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "USER_UPDATED",
        actorId: session.user.id,
        targetId: session.user.id,
      },
    });

    revalidatePath("/meus-pedidos");
    revalidatePath("/");
    return { success: true, user: updated };
  } catch (err) {
    console.error("[updateProfileAction]", err);
    return { success: false, error: "Erro ao atualizar perfil." };
  }
}

// ─────────────────────────────────────────────────────────
// updatePasswordAction — troca senha (apenas usuários com credenciais)
// ─────────────────────────────────────────────────────────
const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual."),
  newPassword: z
    .string()
    .min(6, "Nova senha precisa ter ao menos 6 caracteres."),
});

export async function updatePasswordAction(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado." };

  const parsed = UpdatePasswordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return {
      success: false,
      error: "Sua conta usa login social e não possui senha para alterar.",
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return { success: false, error: "Senha atual incorreta." };
  }

  if (currentPassword === newPassword) {
    return {
      success: false,
      error: "A nova senha deve ser diferente da atual.",
    };
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    return { success: true };
  } catch (err) {
    console.error("[updatePasswordAction]", err);
    return { success: false, error: "Erro ao atualizar senha." };
  }
}
