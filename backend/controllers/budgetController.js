const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

exports.getBudgets = async (req, res) => {
  const userId = req.user.id;
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ message: "Month must be in YYYY-MM format" });
  }

  try {
    const budgets = await Budget.find({ userId, month }).sort({ category: 1 });

    const [year, mon] = month.split("-").map(Number);
    const from = new Date(year, mon - 1, 1);
    const to = new Date(year, mon, 1); // exclusive upper bound

    const spentByCategory = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(String(userId)),
          date: { $gte: from, $lt: to },
        },
      },
      {
        $group: {
          _id: { $toLower: "$category" },
          spent: { $sum: "$amount" },
        },
      },
    ]);

    const spentMap = {};
    spentByCategory.forEach((s) => {
      spentMap[s._id] = s.spent;
    });

    const result = budgets.map((b) => {
      const spent = spentMap[b.category.toLowerCase()] || 0;
      return {
        ...b.toObject(),
        spent,
        remaining: Math.max(b.limit - spent, 0),
        // Not capped at 100 — the client needs the real figure to show
        // how far over budget a category has gone.
        percentUsed: Math.round((spent / b.limit) * 100),
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.upsertBudget = async (req, res) => {
  const userId = req.user.id;
  const { category, limit, month, icon } = req.body;

  if (!category || !limit || !month) {
    return res.status(400).json({ message: "category, limit and month are required" });
  }
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ message: "Month must be in YYYY-MM format" });
  }
  if (isNaN(limit) || Number(limit) <= 0) {
    return res.status(400).json({ message: "Limit must be a positive number" });
  }

  try {
    const budget = await Budget.findOneAndUpdate(
      { userId, category: category.trim(), month },
      { $set: { limit: Number(limit), icon: icon || null } },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(budget);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Budget already exists for this category and month" });
    }
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  const userId = req.user.id;
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
