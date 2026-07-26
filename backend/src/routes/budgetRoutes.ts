import { Router } from "express";
import {
  getBudgets,
  upsertBudget,
  deleteBudget,
} from "../controllers/budgetController";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import {
  budgetSchema,
  budgetQuerySchema,
  idParamSchema,
} from "../validators/schemas";

const router = Router();

router.use(protect);

router.get("/", validate(budgetQuerySchema, "query"), getBudgets);
router.post("/", validate(budgetSchema), upsertBudget);
router.delete("/:id", validate(idParamSchema, "params"), deleteBudget);

export default router;
