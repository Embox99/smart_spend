import { Router } from "express";
import {
  addIncome,
  getAllIncome,
  deleteIncome,
  downloadIncomeExcel,
} from "../controllers/incomeController";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import { incomeSchema, idParamSchema } from "../validators/schemas";

const router = Router();

router.use(protect);

router.post("/add", validate(incomeSchema), addIncome);
router.get("/get", getAllIncome);
router.get("/downloadexcel", downloadIncomeExcel);
router.delete("/:id", validate(idParamSchema, "params"), deleteIncome);

export default router;
