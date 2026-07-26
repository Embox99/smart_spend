/**
 * Contract shared by the API and the client. Types only — nothing here is
 * emitted, so both sides can import it without a build step.
 */

export interface User {
  _id: string;
  fullName: string;
  email: string;
  profileImageUrl: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  id: string;
  user: User;
  token: string;
}

export interface UploadImageResponse {
  imageUrl: string;
  user: User;
}

interface TransactionBase {
  _id: string;
  userId: string;
  icon?: string | null;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Income extends TransactionBase {
  source: string;
}

export interface Expense extends TransactionBase {
  category: string;
}

export type Transaction = Income | Expense;

/** A transaction in the dashboard feed, tagged with which list it came from. */
export type RecentTransaction = (Income | Expense) & {
  type: "income" | "expense";
};

export interface Budget {
  _id: string;
  userId: string;
  category: string;
  /** "YYYY-MM" */
  month: string;
  limit: number;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A budget enriched with the spend computed for its month. */
export interface BudgetWithSpend extends Budget {
  spent: number;
  remaining: number;
  /** Uncapped — can exceed 100 when a category is over budget. */
  percentUsed: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  last30DaysExpenses: { total: number; transactions: Expense[] };
  last60DaysIncome: { total: number; transactions: Income[] };
  recentTransactions: RecentTransaction[];
}

export type SortBy = "date" | "amount";
export type SortOrder = "asc" | "desc";

export interface TransactionFilters {
  search: string;
  from: string;
  to: string;
  minAmount: string;
  maxAmount: string;
  sortBy: SortBy;
  order: SortOrder;
}

export interface ApiError {
  message: string;
}
