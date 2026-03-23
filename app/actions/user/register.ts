"use server";

import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/schemas/user";
import { sendVerificationEmailAction } from "@/app/actions/user/verify-email";
import bcrypt from "bcryptjs";

export async function registerAction(data: unknown) {
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Este e-mail já está cadastrado." };
  }

  const hashed = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: { name, email, password: hashed },
    });

    // Enviar e-mail de verificação (não bloqueia o cadastro se falhar)
    await sendVerificationEmailAction(email, name).catch((err) =>
      console.error("[register] Falha ao enviar e-mail de verificação:", err),
    );

    return { success: true };
  } catch (err) {
    console.error("[registerAction]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }
}
