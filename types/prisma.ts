/**
 * Local type aliases that mirror the Prisma-generated types.
 * These allow the codebase to typecheck before `npx prisma generate` is run.
 * Once the user runs `npx prisma generate`, these can be replaced with
 * direct imports from `@prisma/client`.
 */

export type Category =
  | "HEALTH"
  | "FAMILY"
  | "FINANCES"
  | "RELATIONSHIPS"
  | "WORK_STUDY"
  | "HOLINESS";

export type PrayerStatus = "ACTIVE" | "CHRONIC" | "ANSWERED";

