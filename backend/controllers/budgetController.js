const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// GET /api/v1/budget?month=YYYY-MM
exports.getBudgets = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const month =
    req.validatedQuery?.month || new Date().toISOString().slice(0, 7);

  const [year, mon] = month.split("-").map(Number);
  const from = new Date(year, mon - 1, 1);
  const to = new Date(year, mon, 1); // exclusive upper bound

  const [budgets, spentByCategory] = await Promise.all([
    Budget.find({ userId, month }).sort({ category: 1 }).lean(),
    Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(String(userId)),
          date: { $gte: from, $lt: to },
        },
      },
      { $group: { _id: { $toLower: "$category" }, spent: { $sum: "$amount" } } },
    ]),
  ]);

  const spentMap = new Map(spentByCategory.map((s) => [s._id, s.spent]));

  res.json(
    budgets.map((b) => {
      const spent = spentMap.get(b.category.toLowerCase()) || 0;
      return {
        ...b,
        spent,
        remaining: Math.max(b.limit - spent, 0),
        // Not capped at 100 — the client needs the real figure to show
        // how far over budget a category has gone.
        percentUsed: Math.round((spent / b.limit) * 100),
      };
    })
  );
});

// POST /api/v1/budget
exports.upsertBudget = asyncHandler(async (req, res) => {
  const { category, limit, month, icon } = req.body;

  const budget = await Budget.findOneAndUpdate(
    { userId: req.user.id, category, month },
    { $set: { limit, icon: icon || null } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json(budget);
});

// DELETE /api/v1/budget/:id
exports.deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!budget) throw AppError.notFound("Budget not found");

  res.json({ message: "Budget deleted successfully" });
});
