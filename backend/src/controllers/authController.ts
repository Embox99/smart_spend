import jwt from "jsonwebtoken";
import type { AuthResponse, User as UserDTO } from "@shared/types";
import User, { type UserDocument } from "../models/User";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import type { LoginInput, RegisterInput } from "../validators/schemas";
import { env } from "../config/env";

const generateToken = (id: string): string =>
  jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

const toUserDTO = (user: UserDocument): UserDTO => ({
  _id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  profileImageUrl: user.profileImageUrl,
  createdAt: user.createdAt?.toISOString(),
});

const toAuthResponse = (user: UserDocument): AuthResponse => ({
  id: user._id.toString(),
  user: toUserDTO(user),
  token: generateToken(user._id.toString()),
});

// POST /api/v1/auth/register
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, profileImageUrl } =
    req.body as RegisterInput;

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
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePasswords(password))) {
    // Deliberately identical for unknown email and wrong password.
    throw AppError.badRequest("Invalid credentials");
  }

  res.status(200).json(toAuthResponse(user));
});

// GET /api/v1/auth/getUser
export const getUserInfo = asyncHandler(async (req, res) => {
  res.status(200).json(toUserDTO(req.user as UserDocument));
});

// POST /api/v1/auth/upload-image
export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest("No file uploaded");

  const baseUrl = env.PUBLIC_URL ?? `${req.protocol}://${req.get("host")}`;
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

  // Attach it to the caller so the image cannot be assigned to someone else.
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { profileImageUrl: imageUrl },
    { new: true }
  ).select("-password");

  if (!user) throw AppError.unauthorized();

  res.status(200).json({ imageUrl, user: toUserDTO(user) });
});
