import Expense, { type ExpenseDocument } from "../models/Expense";
import buildQuery from "../utils/buildQuery";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import { sendWorkbook } from "../utils/excel";
import { toMajorUnits } from "../utils/money";
import { buildPagination } from "../utils/pagination";
import type { ExpenseInput } from "../validators/schemas";

const EXPORT_LIMIT = 10000;

// POST /api/v1/expense/add
export const addExpense = asyncHandler(async (req, res) => {
  const { icon, category, amount, date } = req.body as ExpenseInput;

  const expense = await Expense.create({
    userId: req.user?._id,
    icon,
    category,
    amount,
    date,
  });

  res.status(201).json(expense);
});

// GET /api/v1/expense/get
export const getAllExpense = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery<ExpenseDocument>(
    req.query,
    "category"
  );
  const query = { userId: req.user?._id, ...filter };

  const [data, total] = await Promise.all([
    Expense.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Expense.countDocuments(query),
  ]);

  res.json({ data, pagination: buildPagination(total, page, limit) });
});

// PUT /api/v1/expense/:id
export const updateExpense = asyncHandler(async (req, res) => {
  const { icon, category, amount, date } = req.body as ExpenseInput;

  // Scoped by userId so a valid id belonging to someone else 404s rather
  // than being rewritten.
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?._id },
    { $set: { icon: icon ?? null, category, amount, date } },
    { new: true, runValidators: true }
  );

  if (!expense) throw AppError.notFound("Expense not found");

  res.json(expense);
});

// DELETE /api/v1/expense/:id
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    userId: req.user?._id,
  });

  if (!expense) throw AppError.notFound("Expense not found");

  res.json({ message: "Expense deleted successfully" });
});

// GET /api/v1/expense/downloadexcel
export const downloadExpenseExcel = asyncHandler(async (req, res) => {
  const { filter, sort } = buildQuery<ExpenseDocument>(req.query, "category");

  // Capped so one export cannot pull an unbounded collection into memory.
  const expenses = await Expense.find({ userId: req.user?._id, ...filter })
    .sort(sort)
    .limit(EXPORT_LIMIT)
    .lean();

  await sendWorkbook(res, {
    sheetName: "Expense",
    fileName: "expense_details.xlsx",
    columns: [
      { header: "Category", key: "category", width: 24 },
      {
        header: "Amount",
        key: "amount",
        width: 14,
        style: { numFmt: "#,##0.00" },
      },
      {
        header: "Date",
        key: "date",
        width: 14,
        style: { numFmt: "dd/mm/yyyy" },
      },
    ],
    rows: expenses.map((e) => ({
      category: e.category,
      amount: toMajorUnits(e.amount),
      date: new Date(e.date),
    })),
  });
});
