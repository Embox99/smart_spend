import { format, parseISO } from "date-fns";
import type { Expense, Income } from "@shared/types";

export const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getInitials = (name?: string | null): string => {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
};

export const addThousandsSeparator = (num?: number | null): string => {
  if (num == null || isNaN(num)) return "";
  const [integerPart, fractionalPart] = num.toString().split(".");
  const formatted = (integerPart ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fractionalPart ? `${formatted}.${fractionalPart}` : formatted;
};

const safeFormat = (date: string | Date, pattern: string): string => {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, pattern);
  } catch {
    return String(date);
  }
};

const formatDate = (date: string | Date): string => safeFormat(date, "do MMM");

/** "1st Mar 2024" — used by every transaction list. */
export const formatFullDate = (date: string | Date): string =>
  safeFormat(date, "do MMM yyyy");

const byDateAscending = <T extends { date: string }>(items: T[]): T[] =>
  [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

export interface CategoryChartPoint {
  category: string;
  amount: number;
}

export interface DatedChartPoint {
  month: string;
  amount: number;
  category?: string;
}

export const prepareExpenseBarChartData = (
  data: Expense[] = []
): CategoryChartPoint[] =>
  data.map((item) => ({ category: item.category, amount: item.amount }));

export const prepareIncomeBarChartData = (
  data: Income[] = []
): DatedChartPoint[] =>
  byDateAscending(data).map((item) => ({
    month: formatDate(item.date),
    amount: item.amount,
  }));

export const prepareExpenseLineChartData = (
  data: Expense[] = []
): DatedChartPoint[] =>
  byDateAscending(data).map((item) => ({
    month: formatDate(item.date),
    amount: item.amount,
    category: item.category,
  }));
