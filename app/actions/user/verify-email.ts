"use server";

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function sendVerificationEmailAction(email: string, name: string) {
  await prisma.emailVerificationToken.deleteMany({ where: { email } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: {
      token,
      email,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    },
  });

  await sendVerificationEmail(email, name, token);
  return { success: true };
}

export async function verifyEmailAction(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });
  if (!record || record.expires < new Date()) {
    return { success: false, error: "Link inválido ou expirado." };
  }

  await prisma.user.update({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  });

  await prisma.emailVerificationToken.delete({ where: { token } });
  return { success: true };
}
