import type { Expense, Income } from "@shared/types";

/** Form state is all strings — the inputs are uncontrolled by type. */
export interface ExpenseFormValues {
  category: string;
  amount: string;
  date: string;
  icon: string;
}

export interface IncomeFormValues {
  source: string;
  amount: string;
  date: string;
  icon: string;
}

export const EMPTY_EXPENSE_FORM: ExpenseFormValues = {
  category: "",
  amount: "",
  date: "",
  icon: "",
};

export const EMPTY_INCOME_FORM: IncomeFormValues = {
  source: "",
  amount: "",
  date: "",
  icon: "",
};

/**
 * Dates are stored at UTC midnight, so slicing the ISO string gives the same
 * day the user picked, in any timezone.
 */
export const toExpenseFormValues = (expense: Expense): ExpenseFormValues => ({
  category: expense.category,
  amount: String(expense.amount),
  date: expense.date.slice(0, 10),
  icon: expense.icon ?? "",
});

export const toIncomeFormValues = (income: Income): IncomeFormValues => ({
  source: income.source,
  amount: String(income.amount),
  date: income.date.slice(0, 10),
  icon: income.icon ?? "",
});
