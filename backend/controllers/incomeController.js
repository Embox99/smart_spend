const Income = require("../models/Income");
const buildQuery = require("../utils/buildQuery");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendWorkbook } = require("../utils/excel");

const EXPORT_LIMIT = 10000;

// POST /api/v1/income/add
exports.addIncome = asyncHandler(async (req, res) => {
  const { icon, source, amount, date } = req.body;

  const income = await Income.create({
    userId: req.user.id,
    icon,
    source,
    amount,
    date,
  });

  res.status(201).json(income);
});

// GET /api/v1/income/get
exports.getAllIncome = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { filter, sort, skip, limit, page } = buildQuery(req.query, "source");
  const query = { userId, ...filter };

  const [incomes, total] = await Promise.all([
    Income.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Income.countDocuments(query),
  ]);

  res.json({
    data: incomes,
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

// DELETE /api/v1/income/:id
exports.deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!income) throw AppError.notFound("Income not found");

  res.json({ message: "Income deleted successfully" });
});

// GET /api/v1/income/downloadexcel
exports.downloadIncomeExcel = asyncHandler(async (req, res) => {
  const { filter, sort } = buildQuery(req.query, "source");

  // Capped so one export cannot pull an unbounded collection into memory.
  const incomes = await Income.find({ userId: req.user.id, ...filter })
    .sort(sort)
    .limit(EXPORT_LIMIT)
    .lean();

  await sendWorkbook(res, {
    sheetName: "Income",
    fileName: "income_details.xlsx",
    columns: [
      { header: "Source", key: "source", width: 24 },
      { header: "Amount", key: "amount", width: 14, style: { numFmt: "#,##0.00" } },
      { header: "Date", key: "date", width: 14, style: { numFmt: "dd/mm/yyyy" } },
    ],
    rows: incomes.map((i) => ({
      source: i.source,
      amount: i.amount,
      date: new Date(i.date),
    })),
  });
});
