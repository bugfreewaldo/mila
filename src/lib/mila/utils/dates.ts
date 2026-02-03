import {
  format,
  formatDistanceToNow,
  parseISO,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isValid,
  startOfDay,
  endOfDay,
  subDays,
  subHours,
} from "date-fns";
import { es } from "date-fns/locale";
import type { Language } from "../i18n/translations";

/**
 * Get current ISO datetime string
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Get current ISO date string (YYYY-MM-DD)
 */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Format datetime for display (clinical format)
 * English: "Jan 15, 2024 14:30"
 * Spanish: "15/01/24 14:30"
 */
export function formatDateTime(isoString: string, lang: Language = "en"): string {
  const date = parseISO(isoString);
  if (!isValid(date)) return lang === "es" ? "Fecha inválida" : "Invalid date";
  if (lang === "es") {
    return format(date, "dd/MM/yy HH:mm", { locale: es });
  }
  return format(date, "MMM d, yyyy HH:mm");
}

/**
 * Format date only (no time)
 * English: "Jan 15, 2024"
 * Spanish: "15/01/24"
 */
export function formatDate(isoString: string, lang: Language = "en"): string {
  const date = parseISO(isoString);
  if (!isValid(date)) return lang === "es" ? "Fecha inválida" : "Invalid date";
  if (lang === "es") {
    return format(date, "dd/MM/yy", { locale: es });
  }
  return format(date, "MMM d, yyyy");
}

/**
 * Format time only
 * Example: "14:30"
 */
export function formatTime(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) return "--:--";
  return format(date, "HH:mm");
}

/**
 * Format time with seconds
 * Example: "14:30:45"
 */
export function formatTimeWithSeconds(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) return "--:--:--";
  return format(date, "HH:mm:ss");
}

/**
 * Format relative time
 * Example: "5 minutes ago", "2 hours ago"
 */
export function formatRelativeTime(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) return "Unknown";
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Calculate days of life from birth date
 */
export function calculateDaysOfLife(birthDate: string): number {
  const birth = parseISO(birthDate);
  if (!isValid(birth)) return 0;
  return differenceInDays(new Date(), birth) + 1; // +1 because DOL 1 is birth day
}

/**
 * Calculate hours since an event
 */
export function hoursSince(isoString: string): number {
  const date = parseISO(isoString);
  if (!isValid(date)) return 0;
  return differenceInHours(new Date(), date);
}

/**
 * Calculate minutes since an event
 */
export function minutesSince(isoString: string): number {
  const date = parseISO(isoString);
  if (!isValid(date)) return 0;
  return differenceInMinutes(new Date(), date);
}

/**
 * Get start of day ISO string
 */
export function getStartOfDay(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) return isoString;
  return startOfDay(date).toISOString();
}

/**
 * Get end of day ISO string
 */
export function getEndOfDay(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) return isoString;
  return endOfDay(date).toISOString();
}

/**
 * Get ISO string for N days ago
 */
export function daysAgo(days: number): string {
  return subDays(new Date(), days).toISOString();
}

/**
 * Get ISO string for N hours ago
 */
export function hoursAgo(hours: number): string {
  return subHours(new Date(), hours).toISOString();
}

/**
 * Format gestational age
 * Example: "32+4" (32 weeks, 4 days)
 */
export function formatGestationalAge(weeks: number): string {
  const fullWeeks = Math.floor(weeks);
  const days = Math.round((weeks - fullWeeks) * 7);
  return `${fullWeeks}+${days}`;
}

/**
 * Group dates by day for timeline display
 */
export function groupByDay<T extends { occurredAt: string }>(
  items: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const dayKey = item.occurredAt.split("T")[0];
    const existing = groups.get(dayKey) || [];
    existing.push(item);
    groups.set(dayKey, existing);
  }

  return groups;
}

/**
 * Check if date is today
 */
export function isToday(isoString: string): boolean {
  const date = parseISO(isoString);
  if (!isValid(date)) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Format for chart axis labels
 */
export function formatChartTime(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) return "";
  return format(date, "HH:mm");
}

export function formatChartDate(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) return "";
  return format(date, "MM/dd");
}
