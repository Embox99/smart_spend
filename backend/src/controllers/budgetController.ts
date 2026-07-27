import { Types } from "mongoose";
import type { BudgetWithSpend } from "@shared/types";
import Budget from "../models/Budget";
import Expense from "../models/Expense";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import { monthRange } from "../utils/dateRange";
import type { BudgetInput, BudgetQuery } from "../validators/schemas";

interface SpentRow {
  _id: string;
  spent: number;
}

// GET /api/v1/budget?month=YYYY-MM
export const getBudgets = asyncHandler(async (req, res) => {
  const userId = req.user?._id as Types.ObjectId;
  const query = req.validatedQuery as BudgetQuery | undefined;
  const month = query?.month ?? new Date().toISOString().slice(0, 7);

  const { from, to } = monthRange(month);

  const [budgets, spentByCategory] = await Promise.all([
    Budget.find({ userId, month }).sort({ category: 1 }).lean(),
    Expense.aggregate<SpentRow>([
      { $match: { userId, date: { $gte: from, $lt: to } } },
      { $group: { _id: { $toLower: "$category" }, spent: { $sum: "$amount" } } },
    ]),
  ]);

  const spentMap = new Map(spentByCategory.map((s) => [s._id, s.spent]));

  const result: BudgetWithSpend[] = budgets.map((b) => {
    const spent = spentMap.get(b.category.toLowerCase()) ?? 0;
    return {
      ...b,
      _id: b._id.toString(),
      userId: b.userId.toString(),
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      spent,
      remaining: Math.max(b.limit - spent, 0),
      // Not capped at 100 — the client needs the real figure to show
      // how far over budget a category has gone.
      percentUsed: Math.round((spent / b.limit) * 100),
    };
  });

  res.json(result);
});

// POST /api/v1/budget
export const upsertBudget = asyncHandler(async (req, res) => {
  const { category, limit, month, icon } = req.body as BudgetInput;

  const budget = await Budget.findOneAndUpdate(
    { userId: req.user?._id, category, month },
    { $set: { limit, icon: icon ?? null } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json(budget);
});

// DELETE /api/v1/budget/:id
export const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.params.id,
    userId: req.user?._id,
  });

  if (!budget) throw AppError.notFound("Budget not found");

  res.json({ message: "Budget deleted successfully" });
});
