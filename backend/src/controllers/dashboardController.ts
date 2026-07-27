import type { Model, Types } from "mongoose";
import Income, { type IncomeDocument } from "../models/Income";
import Expense, { type ExpenseDocument } from "../models/Expense";
import asyncHandler from "../utils/asyncHandler";

const DAY = 24 * 60 * 60 * 1000;
const FEED_SIZE = 10;
/** Rows each per-ledger feed shows. */
const FEED_ROWS = 5;
const MAX_CHART_SLICES = 8;

interface TotalRow {
  _id: null;
  total: number;
}

interface GroupRow {
  _id: string;
  label: string;
  amount: number;
}

const sumFor = <T>(model: Model<T>, userId: Types.ObjectId) =>
  model.aggregate<TotalRow>([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

/**
 * Groups a window of transactions by one field. Done here rather than on the
 * client so the response carries a handful of chart slices instead of every
 * raw record in the period.
 */
const groupBy = <T>(
  model: Model<T>,
  userId: Types.ObjectId,
  field: "category" | "source",
  since: Date
) =>
  model.aggregate<GroupRow>([
    { $match: { userId, date: { $gte: since } } },
    {
      $group: {
        // Case-insensitive, matching how budgets attribute spend, but the
        // original casing is kept for display.
        _id: { $toLower: `$${field}` },
        label: { $first: `$${field}` },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { amount: -1 } },
    { $limit: MAX_CHART_SLICES },
  ]);

const windowTotal = <T>(model: Model<T>, userId: Types.ObjectId, since: Date) =>
  model.aggregate<TotalRow>([
    { $match: { userId, date: { $gte: since } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

const toSlices = (rows: GroupRow[]) =>
  rows.map(({ label, amount }) => ({ label, amount }));

// GET /api/v1/dashboard
export const getDashboardData = asyncHandler(async (req, res) => {
  const userId = req.user?._id as Types.ObjectId;
  const since30 = new Date(Date.now() - 30 * DAY);
  const since60 = new Date(Date.now() - 60 * DAY);

  // None of these depend on each other — run them as one round trip.
  const [
    totalIncomeRows,
    totalExpenseRows,
    expenseByCategory,
    incomeBySource,
    expenseWindowTotal,
    incomeWindowTotal,
    recentIncome,
    recentExpense,
  ] = await Promise.all([
    sumFor<IncomeDocument>(Income, userId),
    sumFor<ExpenseDocument>(Expense, userId),
    groupBy<ExpenseDocument>(Expense, userId, "category", since30),
    groupBy<IncomeDocument>(Income, userId, "source", since60),
    windowTotal<ExpenseDocument>(Expense, userId, since30),
    windowTotal<IncomeDocument>(Income, userId, since60),
    Income.find({ userId }).sort({ date: -1 }).limit(FEED_SIZE).lean(),
    Expense.find({ userId }).sort({ date: -1 }).limit(FEED_SIZE).lean(),
  ]);

  const totalIncome = totalIncomeRows[0]?.total ?? 0;
  const totalExpense = totalExpenseRows[0]?.total ?? 0;

  // Merge both ledgers, then cut — taking the newest of each separately
  // would return five of one kind even when ten of the other are newer.
  const recentTransactions = [
    ...recentIncome.map((t) => ({ ...t, type: "income" as const })),
    ...recentExpense.map((t) => ({ ...t, type: "expense" as const })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED_SIZE);

  res.json({
    totalBalance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    last30DaysExpenses: {
      total: expenseWindowTotal[0]?.total ?? 0,
      byCategory: toSlices(expenseByCategory),
    },
    last60DaysIncome: {
      total: incomeWindowTotal[0]?.total ?? 0,
      bySource: toSlices(incomeBySource),
    },
    recentExpenses: recentExpense.slice(0, FEED_ROWS),
    recentIncome: recentIncome.slice(0, FEED_ROWS),
    recentTransactions,
  });
});
