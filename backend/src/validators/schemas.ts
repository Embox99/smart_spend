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

// Empty strings arrive from a cleared textarea; store them as absent.
const note = z
  .string()
  .trim()
  .max(280, "Note must be 280 characters or fewer")
  .optional()
  .transform((value) => value || undefined);

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

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(80),
  email: z.email("Please enter a valid email address").trim().toLowerCase(),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(128),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must differ from the current one",
    path: ["newPassword"],
  });

export const expenseSchema = z.object({
  category: z.string().trim().min(1, "Category is required").max(60),
  amount: positiveAmount,
  date: isoDate,
  icon,
  note,
});

export const incomeSchema = z.object({
  source: z.string().trim().min(1, "Source is required").max(60),
  amount: positiveAmount,
  date: isoDate,
  icon,
  note,
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
export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type BudgetQuery = z.infer<typeof budgetQuerySchema>;
