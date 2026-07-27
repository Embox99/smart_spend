import { API_PATH } from "./apiPaths";

/**
 * Every query key in one place. Income, expenses, budgets and the dashboard
 * are views over the same records, so a mutation to one invalidates several
 * of the others — keeping the keys together is what makes that tractable.
 */
export const queryKeys = {
  user: ["user"] as const,
  dashboard: ["dashboard"] as const,
  budgets: ["budgets"] as const,
  budgetsForMonth: (month: string) => ["budgets", month] as const,
  income: [API_PATH.INCOME.GET_ALL_INCOME] as const,
  expenses: [API_PATH.EXPENSE.GET_ALL_EXPENSE] as const,
} as const;
