import { Router } from "express";
import {
  addExpense,
  getAllExpense,
  deleteExpense,
  downloadExpenseExcel,
} from "../controllers/expenseController";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import { expenseSchema, idParamSchema } from "../validators/schemas";

const router = Router();

router.use(protect);

router.post("/add", validate(expenseSchema), addExpense);
router.get("/get", getAllExpense);
router.get("/downloadexcel", downloadExpenseExcel);
router.delete("/:id", validate(idParamSchema, "params"), deleteExpense);

export default router;
