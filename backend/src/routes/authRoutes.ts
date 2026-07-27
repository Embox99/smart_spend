import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import { registerSchema, loginSchema } from "../validators/schemas";
import { authLimiter, uploadLimiter } from "../middleware/rateLimiters";
import upload from "../middleware/uploadMiddleware";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserInfo,
  uploadProfileImage,
} from "../controllers/authController";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.get("/getUser", protect, getUserInfo);

router.post(
  "/upload-image",
  protect,
  uploadLimiter,
  upload.single("image"),
  uploadProfileImage
);

export default router;
