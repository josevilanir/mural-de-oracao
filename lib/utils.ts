import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format date relative to now in pt-BR. */
export function formatRelativeDate(date: Date | string): string {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ptBR,
  });
}

/**
 * RF05 — Sanitize prayer anonymity server-side.
 * MUST be called on every query that returns Prayer data.
 * The client NEVER receives authorId or real author data for anonymous prayers.
 */
export function sanitizePrayer<T extends {
  isAnonymous: boolean;
  authorId?: string | null;
  author?: { name: string | null; image: string | null } | null;
}>(prayer: T): T {
  if (!prayer.isAnonymous) return prayer;

  return {
    ...prayer,
    authorId: null,
    author: prayer.author
      ? { name: "Anônimo", image: null }
      : prayer.author,
  };
}

/** Sanitize an array of prayers. */
export function sanitizePrayers<T extends {
  isAnonymous: boolean;
  authorId?: string | null;
  author?: { name: string | null; image: string | null } | null;
}>(prayers: T[]): T[] {
  return prayers.map(sanitizePrayer);
}

/** Map Category enum to label + emoji. */
export const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  HEALTH:        { label: "Saúde",          emoji: "" },
  FAMILY:        { label: "Família",        emoji: "" },
  FINANCES:      { label: "Finanças",       emoji: "" },
  RELATIONSHIPS: { label: "Relacionamentos", emoji: "" },
  WORK_STUDY:    { label: "Estudos",        emoji: "" },
  HOLINESS:      { label: "Santidade",      emoji: "" },
};

/** Map PrayerStatus enum to label + emoji. */
export const STATUS_LABELS: Record<string, { label: string; emoji: string }> = {
  ACTIVE:   { label: "Em oração",  emoji: "" },
  CHRONIC:  { label: "Crônico",    emoji: "" },
  ANSWERED: { label: "Respondido", emoji: "" },
};
