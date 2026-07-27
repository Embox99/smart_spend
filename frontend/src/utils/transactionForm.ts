import type { Expense, Income } from "@shared/types";
import { toMajorUnits } from "./money";

/** Form state is all strings — the inputs are uncontrolled by type. */
export const NOTE_MAX_LENGTH = 280;

export interface ExpenseFormValues {
  category: string;
  amount: string;
  date: string;
  icon: string;
  note: string;
}

export interface IncomeFormValues {
  source: string;
  amount: string;
  date: string;
  icon: string;
  note: string;
}

export const EMPTY_EXPENSE_FORM: ExpenseFormValues = {
  category: "",
  amount: "",
  date: "",
  icon: "",
  note: "",
};

export const EMPTY_INCOME_FORM: IncomeFormValues = {
  source: "",
  amount: "",
  date: "",
  icon: "",
  note: "",
};

/**
 * Dates are stored at UTC midnight, so slicing the ISO string gives the same
 * day the user picked, in any timezone.
 */
export const toExpenseFormValues = (expense: Expense): ExpenseFormValues => ({
  category: expense.category,
  amount: String(toMajorUnits(expense.amount)),
  date: expense.date.slice(0, 10),
  icon: expense.icon ?? "",
  note: expense.note ?? "",
});

export const toIncomeFormValues = (income: Income): IncomeFormValues => ({
  source: income.source,
  amount: String(toMajorUnits(income.amount)),
  date: income.date.slice(0, 10),
  icon: income.icon ?? "",
  note: income.note ?? "",
});
