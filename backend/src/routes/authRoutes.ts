import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import validate from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  profileSchema,
  passwordSchema,
} from "../validators/schemas";
import { authLimiter, uploadLimiter } from "../middleware/rateLimiters";
import upload from "../middleware/uploadMiddleware";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserInfo,
  updateProfile,
  changePassword,
  removeProfileImage,
  uploadProfileImage,
} from "../controllers/authController";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.get("/getUser", protect, getUserInfo);

router.patch("/profile", protect, validate(profileSchema), updateProfile);
router.patch(
  "/password",
  protect,
  authLimiter,
  validate(passwordSchema),
  changePassword
);
router.delete("/profile-image", protect, removeProfileImage);

router.post(
  "/upload-image",
  protect,
  uploadLimiter,
  upload.single("image"),
  uploadProfileImage
);

export default router;
