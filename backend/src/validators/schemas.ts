import { z } from "zod";
import { MAX_MINOR_UNITS, toMinorUnits } from "../utils/money";

/**
 * Amounts arrive as decimal strings from form inputs and as numbers from
 * JSON, and are stored as integer minor units. The conversion happens here so
 * no controller ever sees a decimal amount.
 */
const positiveAmount = z.coerce
  .number({ message: "Amount must be a number" })
  .positive("Amount must be a positive number")
  .finite()
  .transform(toMinorUnits)
  .refine((minor) => minor > 0, "Amount must be at least 0.01")
  .refine((minor) => minor <= MAX_MINOR_UNITS, "Amount is too large");

const isoDate = z.coerce.date({ message: "Invalid date" });

const monthString = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Malformed identifier");

const icon = z.string().max(2048).nullish();

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(80),
  email: z.email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  profileImageUrl: z.url().nullish().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Please enter your password"),
});

export const expenseSchema = z.object({
  category: z.string().trim().min(1, "Category is required").max(60),
  amount: positiveAmount,
  date: isoDate,
  icon,
});

export const incomeSchema = z.object({
  source: z.string().trim().min(1, "Source is required").max(60),
  amount: positiveAmount,
  date: isoDate,
  icon,
});

export const budgetSchema = z.object({
  category: z.string().trim().min(1, "Category is required").max(60),
  limit: positiveAmount,
  month: monthString,
  icon,
});

export const budgetQuerySchema = z.object({
  month: monthString.optional(),
});

export const idParamSchema = z.object({ id: objectId });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type BudgetQuery = z.infer<typeof budgetQuerySchema>;
