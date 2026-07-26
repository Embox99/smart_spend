const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const toAuthResponse = (user) => ({
  id: user._id,
  user: {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    createdAt: user.createdAt,
  },
  token: generateToken(user._id),
});

// POST /api/v1/auth/register
exports.registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, profileImageUrl } = req.body;

  if (await User.exists({ email })) {
    throw AppError.badRequest("Email is already used");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    profileImageUrl: profileImageUrl || null,
  });

  res.status(201).json(toAuthResponse(user));
});

// POST /api/v1/auth/login
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePasswords(password))) {
    // Deliberately identical for unknown email and wrong password.
    throw AppError.badRequest("Invalid credentials");
  }

  res.status(200).json(toAuthResponse(user));
});

// GET /api/v1/auth/getUser
exports.getUserInfo = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// POST /api/v1/auth/upload-image
exports.uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest("No file uploaded");

  const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

  // Attach it to the caller so the image cannot be assigned to someone else.
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profileImageUrl: imageUrl },
    { new: true }
  ).select("-password");

  res.status(200).json({ imageUrl, user });
});
