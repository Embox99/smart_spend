const express = require("express");
const {
  addIncome,
  getAllIncome,
  deleteIncome,
  downloadIncomeExcel,
} = require("../controllers/incomeController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { incomeSchema, idParamSchema } = require("../validators/schemas");

const router = express.Router();

router.use(protect);

router.post("/add", validate(incomeSchema), addIncome);
router.get("/get", getAllIncome);
router.get("/downloadexcel", downloadIncomeExcel);
router.delete("/:id", validate(idParamSchema, "params"), deleteIncome);

module.exports = router;
