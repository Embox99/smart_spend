import Income, { type IncomeDocument } from "../models/Income";
import buildQuery from "../utils/buildQuery";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import { sendWorkbook } from "../utils/excel";
import { toMajorUnits } from "../utils/money";
import { buildPagination } from "../utils/pagination";
import type { IncomeInput } from "../validators/schemas";

const EXPORT_LIMIT = 10000;

// POST /api/v1/income/add
export const addIncome = asyncHandler(async (req, res) => {
  const { icon, source, amount, date, note } = req.body as IncomeInput;

  const income = await Income.create({
    userId: req.user?._id,
    icon,
    source,
    amount,
    date,
    note,
  });

  res.status(201).json(income);
});

// GET /api/v1/income/get
export const getAllIncome = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery<IncomeDocument>(
    req.query,
    "source"
  );
  const query = { userId: req.user?._id, ...filter };

  const [data, total] = await Promise.all([
    Income.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Income.countDocuments(query),
  ]);

  res.json({ data, pagination: buildPagination(total, page, limit) });
});

// PUT /api/v1/income/:id
export const updateIncome = asyncHandler(async (req, res) => {
  const { icon, source, amount, date, note, updatedAt } =
    req.body as IncomeInput;

  // Scoped by userId so a valid id belonging to someone else 404s rather
  // than being rewritten. When the caller states the version it loaded, that
  // becomes part of the match, so a record edited elsewhere is not clobbered.
  const owned = { _id: req.params.id, userId: req.user?._id };
  const income = await Income.findOneAndUpdate(
    updatedAt ? { ...owned, updatedAt } : owned,
    { $set: { icon: icon ?? null, source, amount, date, note: note ?? null } },
    { new: true, runValidators: true }
  );

  if (!income) {
    // Distinguish "gone" from "moved on" — they need different UI.
    if (updatedAt && (await Income.exists(owned))) {
      throw AppError.conflict(
        "This income changed elsewhere. Reload before saving."
      );
    }
    throw AppError.notFound("Income not found");
  }

  res.json(income);
});

// DELETE /api/v1/income/:id
export const deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOneAndDelete({
    _id: req.params.id,
    userId: req.user?._id,
  });

  if (!income) throw AppError.notFound("Income not found");

  res.json({ message: "Income deleted successfully" });
});

// GET /api/v1/income/downloadexcel
export const downloadIncomeExcel = asyncHandler(async (req, res) => {
  const { filter, sort } = buildQuery<IncomeDocument>(req.query, "source");

  // Capped so one export cannot pull an unbounded collection into memory.
  const incomes = await Income.find({ userId: req.user?._id, ...filter })
    .sort(sort)
    .limit(EXPORT_LIMIT)
    .lean();

  await sendWorkbook(res, {
    sheetName: "Income",
    fileName: "income_details.xlsx",
    columns: [
      { header: "Source", key: "source", width: 24 },
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
      { header: "Note", key: "note", width: 40 },
    ],
    truncated: incomes.length === EXPORT_LIMIT,
    rows: incomes.map((i) => ({
      source: i.source,
      amount: toMajorUnits(i.amount),
      date: new Date(i.date),
      note: i.note ?? "",
    })),
  });
});
