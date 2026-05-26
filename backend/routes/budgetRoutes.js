const express = require("express");
const { getBudgets, upsertBudget, deleteBudget } = require("../controllers/budgetController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getBudgets);          // GET  /api/v1/budget?month=2024-03
router.post("/", protect, upsertBudget);       // POST /api/v1/budget
router.delete("/:id", protect, deleteBudget); // DELETE /api/v1/budget/:id

module.exports = router;
