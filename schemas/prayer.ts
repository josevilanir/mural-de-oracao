import { z } from "zod";

export const CreatePrayerSchema = z.object({
  title: z
    .string()
    .min(5, "O título precisa ter entre 5 e 100 caracteres")
    .max(100, "O título precisa ter entre 5 e 100 caracteres"),
  description: z
    .string()
    .min(20, "Conte um pouco mais — mínimo 20 caracteres")
    .max(1000, "Máximo 1000 caracteres"),
  category: z.enum(
    ["HEALTH", "FAMILY", "FINANCES", "RELATIONSHIPS", "WORK_STUDY", "HOLINESS"] as const,
    { error: "Por favor, selecione uma categoria" }
  ),
  verseReference: z
    .string()
    .max(100, "Versículo muito longo (máx 100 caracteres)")
    .optional()
    .or(z.literal("")),
  isAnonymous: z.boolean(),
  allowComments: z.boolean(),
  visibility: z.enum(["PUBLIC", "GROUP_ONLY"] as const).default("PUBLIC"),
  groupId: z.string().optional(),
});

export type CreatePrayerInput = z.infer<typeof CreatePrayerSchema>;

export const UpdatePrayerSchema = CreatePrayerSchema.partial();
export type UpdatePrayerInput = z.infer<typeof UpdatePrayerSchema>;

export const ResolveTestimonySchema = z.object({
  prayerId: z.string().min(1),
  testimony: z
    .string()
    .min(20, "Conte um pouco mais — mínimo 20 caracteres")
    .max(2000, "Máximo 2000 caracteres"),
});
export type ResolveTestimonyInput = z.infer<typeof ResolveTestimonySchema>;

export const CreateCommentSchema = z.object({
  prayerId: z.string().min(1),
  text: z.string().min(3, "Mínimo 3 caracteres").max(500, "Máximo 500 caracteres"),
});
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
