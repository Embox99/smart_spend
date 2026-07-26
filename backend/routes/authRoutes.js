const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/schemas");
const { authLimiter, uploadLimiter } = require("../middleware/rateLimiters");
const upload = require("../middleware/uploadMiddleware");

const {
  registerUser,
  loginUser,
  getUserInfo,
  uploadProfileImage,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.get("/getUser", protect, getUserInfo);

router.post(
  "/upload-image",
  protect,
  uploadLimiter,
  upload.single("image"),
  uploadProfileImage
);

module.exports = router;
