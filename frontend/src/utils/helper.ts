import { format, parseISO } from "date-fns";
import type { Expense, Income } from "@shared/types";
import type { ChartPoint } from "../components/charts/chartTypes";

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

/** Dated series for the paginated Income and Expense pages. */
export const prepareIncomeBarChartData = (
  data: Income[] = []
): ChartPoint[] =>
  byDateAscending(data).map((item) => ({
    label: formatDate(item.date),
    amount: item.amount,
  }));

export const prepareExpenseLineChartData = (
  data: Expense[] = []
): ChartPoint[] =>
  byDateAscending(data).map((item) => ({
    label: formatDate(item.date),
    amount: item.amount,
  }));
