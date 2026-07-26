const Expense = require("../models/Expense");
const buildQuery = require("../utils/buildQuery");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendWorkbook } = require("../utils/excel");

const EXPORT_LIMIT = 10000;

// POST /api/v1/expense/add
exports.addExpense = asyncHandler(async (req, res) => {
  const { icon, category, amount, date } = req.body;

  const expense = await Expense.create({
    userId: req.user.id,
    icon,
    category,
    amount,
    date,
  });

  res.status(201).json(expense);
});

// GET /api/v1/expense/get
exports.getAllExpense = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { filter, sort, skip, limit, page } = buildQuery(req.query, "category");
  const query = { userId, ...filter };

  const [expenses, total] = await Promise.all([
    Expense.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Expense.countDocuments(query),
  ]);

  res.json({
    data: expenses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
});

// DELETE /api/v1/expense/:id
exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!expense) throw AppError.notFound("Expense not found");

  res.json({ message: "Expense deleted successfully" });
});

// GET /api/v1/expense/downloadexcel
exports.downloadExpenseExcel = asyncHandler(async (req, res) => {
  const { filter, sort } = buildQuery(req.query, "category");

  // Capped so one export cannot pull an unbounded collection into memory.
  const expenses = await Expense.find({ userId: req.user.id, ...filter })
    .sort(sort)
    .limit(EXPORT_LIMIT)
    .lean();

  await sendWorkbook(res, {
    sheetName: "Expense",
    fileName: "expense_details.xlsx",
    columns: [
      { header: "Category", key: "category", width: 24 },
      { header: "Amount", key: "amount", width: 14, style: { numFmt: "#,##0.00" } },
      { header: "Date", key: "date", width: 14, style: { numFmt: "dd/mm/yyyy" } },
    ],
    rows: expenses.map((e) => ({
      category: e.category,
      amount: e.amount,
      date: new Date(e.date),
    })),
  });
});
