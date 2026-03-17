"use server";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";

const EmailSchema = z.string().email("E-mail inválido.");
const PasswordSchema = z.string().min(6, "A senha precisa ter ao menos 6 caracteres.");

export async function forgotPasswordAction(email: unknown) {
  const parsed = EmailSchema.safeParse(email);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  // Não revelar se o e-mail existe (previne enumeração)
  const user = await prisma.user.findUnique({ where: { email: parsed.data } });
  if (!user || !user.password) return { success: true }; // OAuth user or not found — silently succeed

  // Invalidar tokens anteriores
  await prisma.passwordResetToken.deleteMany({ where: { email: parsed.data } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      token,
      email: parsed.data,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    },
  });

  await sendPasswordResetEmail(parsed.data, token);
  return { success: true };
}

export async function resetPasswordAction(token: string, newPassword: unknown) {
  const parsed = PasswordSchema.safeParse(newPassword);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return { success: false, error: "Link inválido ou expirado. Solicite um novo." };
  }

  const hashed = await bcrypt.hash(parsed.data, 12);
  await prisma.user.update({
    where: { email: record.email },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.delete({ where: { token } });
  return { success: true };
}
