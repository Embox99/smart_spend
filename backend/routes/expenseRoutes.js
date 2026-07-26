const express = require("express");
const {
  addExpense,
  getAllExpense,
  deleteExpense,
  downloadExpenseExcel,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { expenseSchema, idParamSchema } = require("../validators/schemas");

const router = express.Router();

router.use(protect);

router.post("/add", validate(expenseSchema), addExpense);
router.get("/get", getAllExpense);
router.get("/downloadexcel", downloadExpenseExcel);
router.delete("/:id", validate(idParamSchema, "params"), deleteExpense);

module.exports = router;
