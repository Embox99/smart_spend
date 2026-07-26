import type { Model, Types } from "mongoose";
import Income, { type IncomeDocument } from "../models/Income";
import Expense, { type ExpenseDocument } from "../models/Expense";
import asyncHandler from "../utils/asyncHandler";

const DAY = 24 * 60 * 60 * 1000;

interface TotalRow {
  _id: null;
  total: number;
}

const sumFor = <T>(model: Model<T>, userId: Types.ObjectId) =>
  model.aggregate<TotalRow>([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

const sumAmount = (rows: { amount: number }[]): number =>
  rows.reduce((sum, t) => sum + t.amount, 0);

// GET /api/v1/dashboard
export const getDashboardData = asyncHandler(async (req, res) => {
  const userId = req.user?._id as Types.ObjectId;

  // None of these depend on each other — run them as one round trip.
  const [
    totalIncomeRows,
    totalExpenseRows,
    last60DaysIncomeTransactions,
    last30DaysExpenseTransactions,
    recentIncome,
    recentExpense,
  ] = await Promise.all([
    sumFor<IncomeDocument>(Income, userId),
    sumFor<ExpenseDocument>(Expense, userId),
    Income.find({ userId, date: { $gte: new Date(Date.now() - 60 * DAY) } })
      .sort({ date: -1 })
      .lean(),
    Expense.find({ userId, date: { $gte: new Date(Date.now() - 30 * DAY) } })
      .sort({ date: -1 })
      .lean(),
    Income.find({ userId }).sort({ date: -1 }).limit(5).lean(),
    Expense.find({ userId }).sort({ date: -1 }).limit(5).lean(),
  ]);

  const totalIncome = totalIncomeRows[0]?.total ?? 0;
  const totalExpense = totalExpenseRows[0]?.total ?? 0;

  const recentTransactions = [
    ...recentIncome.map((t) => ({ ...t, type: "income" as const })),
    ...recentExpense.map((t) => ({ ...t, type: "expense" as const })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  res.json({
    totalBalance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    last30DaysExpenses: {
      total: sumAmount(last30DaysExpenseTransactions),
      transactions: last30DaysExpenseTransactions,
    },
    last60DaysIncome: {
      total: sumAmount(last60DaysIncomeTransactions),
      transactions: last60DaysIncomeTransactions,
    },
    recentTransactions,
  });
});
