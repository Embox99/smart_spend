const express = require("express");
const {
  getBudgets,
  upsertBudget,
  deleteBudget,
} = require("../controllers/budgetController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  budgetSchema,
  budgetQuerySchema,
  idParamSchema,
} = require("../validators/schemas");

const router = express.Router();

router.use(protect);

router.get("/", validate(budgetQuerySchema, "query"), getBudgets);
router.post("/", validate(budgetSchema), upsertBudget);
router.delete("/:id", validate(idParamSchema, "params"), deleteBudget);

module.exports = router;
