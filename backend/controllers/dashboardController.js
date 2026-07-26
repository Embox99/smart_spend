const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

const DAY = 24 * 60 * 60 * 1000;

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new Types.ObjectId(String(userId));

    const sumFor = (Model) =>
      Model.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

    // None of these depend on each other — run them as one round trip.
    const [
      totalIncome,
      totalExpense,
      last60DaysIncomeTransactions,
      last30DaysExpenseTransactions,
      recentIncome,
      recentExpense,
    ] = await Promise.all([
      sumFor(Income),
      sumFor(Expense),
      Income.find({
        userId: userObjectId,
        date: { $gte: new Date(Date.now() - 60 * DAY) },
      }).sort({ date: -1 }),
      Expense.find({
        userId: userObjectId,
        date: { $gte: new Date(Date.now() - 30 * DAY) },
      }).sort({ date: -1 }),
      Income.find({ userId: userObjectId }).sort({ date: -1 }).limit(5),
      Expense.find({ userId: userObjectId }).sort({ date: -1 }).limit(5),
    ]);

    const sumAmount = (rows) => rows.reduce((sum, t) => sum + t.amount, 0);

    const recentTransactions = [
      ...recentIncome.map((t) => ({ ...t.toObject(), type: "income" })),
      ...recentExpense.map((t) => ({ ...t.toObject(), type: "expense" })),
    ].sort((a, b) => b.date - a.date);

    res.json({
      totalBalance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
      totalIncome: totalIncome[0]?.total || 0,
      totalExpense: totalExpense[0]?.total || 0,
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
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
