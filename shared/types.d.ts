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
  /**
   * When the session cookie lapses, ISO-8601. The token itself is httpOnly
   * and never reaches JavaScript; this only lets the client decide what to
   * render. The server remains the authority.
   */
  expiresAt: string;
}

export interface UploadImageResponse {
  imageUrl: string;
  user: User;
}

interface TransactionBase {
  _id: string;
  userId: string;
  icon?: string | null;
  /**
   * Integer minor units (cents). Every amount crossing this boundary is an
   * integer so sums stay exact; format for display, never for arithmetic.
   */
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
  /** Integer minor units (cents). */
  limit: number;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A budget enriched with the spend computed for its month. */
export interface BudgetWithSpend extends Budget {
  /** Integer minor units (cents). */
  spent: number;
  /** Integer minor units (cents). */
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

/** One slice of a chart, already grouped server-side. */
export interface CategoryTotal {
  label: string;
  /** Integer minor units (cents). */
  amount: number;
}

export interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  last30DaysExpenses: {
    total: number;
    /** Grouped by category — one entry per category, not per transaction. */
    byCategory: CategoryTotal[];
  };
  last60DaysIncome: {
    total: number;
    bySource: CategoryTotal[];
  };
  /** Feeds render a handful of rows, so only those are sent. */
  recentExpenses: Expense[];
  recentIncome: Income[];
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
