const xlsx = require("xlsx");
const Income = require("../models/Income");
const buildQuery = require("../utils/buildQuery");

exports.addIncome = async (req, res) => {
  const userId = req.user.id;
  try {
    const { icon, source, amount, date } = req.body;

    if (!source || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    const newIncome = new Income({
      userId, icon, source,
      amount: Number(amount),
      date: new Date(date),
    });

    await newIncome.save();
    res.status(201).json(newIncome);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllIncome = async (req, res) => {
  const userId = req.user.id;
  try {
    const { filter, sort, skip, limit, page } = buildQuery(req.query, "source");

    const [incomes, total] = await Promise.all([
      Income.find({ userId, ...filter }).sort(sort).skip(skip).limit(limit),
      Income.countDocuments({ userId, ...filter }),
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
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteIncome = async (req, res) => {
  const userId = req.user.id;
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId });
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }
    res.json({ message: "Income deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const { filter, sort } = buildQuery(req.query, "source");
    const incomes = await Income.find({ userId, ...filter }).sort(sort);

    const data = incomes.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: new Date(item.date).toLocaleDateString("en-GB"),
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "income");
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=income_details.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
