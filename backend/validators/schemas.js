const { z } = require("zod");

// Amounts arrive as strings from form inputs and as numbers from JSON.
const positiveAmount = z.coerce
  .number({ message: "Amount must be a number" })
  .positive("Amount must be a positive number")
  .finite();

const isoDate = z.coerce.date({ message: "Invalid date" });

const monthString = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Malformed identifier");

const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(80),
  email: z.email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  profileImageUrl: z.url().nullish().or(z.literal("")),
});

const loginSchema = z.object({
  email: z.email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Please enter your password"),
});

const expenseSchema = z.object({
  category: z.string().trim().min(1, "Category is required").max(60),
  amount: positiveAmount,
  date: isoDate,
  icon: z.string().max(2048).nullish(),
});

const incomeSchema = z.object({
  source: z.string().trim().min(1, "Source is required").max(60),
  amount: positiveAmount,
  date: isoDate,
  icon: z.string().max(2048).nullish(),
});

const budgetSchema = z.object({
  category: z.string().trim().min(1, "Category is required").max(60),
  limit: positiveAmount,
  month: monthString,
  icon: z.string().max(2048).nullish(),
});

const budgetQuerySchema = z.object({
  month: monthString.optional(),
});

const idParamSchema = z.object({ id: objectId });

module.exports = {
  registerSchema,
  loginSchema,
  expenseSchema,
  incomeSchema,
  budgetSchema,
  budgetQuerySchema,
  idParamSchema,
};
