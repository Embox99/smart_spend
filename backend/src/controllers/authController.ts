import jwt from "jsonwebtoken";
import type { Response } from "express";
import type { AuthResponse, User as UserDTO } from "@shared/types";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie";
import User, { type UserDocument } from "../models/User";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/AppError";
import type {
  LoginInput,
  PasswordInput,
  ProfileInput,
  RegisterInput,
} from "../validators/schemas";
import { env } from "../config/env";

const generateToken = (user: UserDocument): string =>
  jwt.sign({ id: user._id.toString(), v: user.tokenVersion }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

const toUserDTO = (user: UserDocument): UserDTO => ({
  _id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  profileImageUrl: user.profileImageUrl,
  createdAt: user.createdAt?.toISOString(),
});

/**
 * Issues the session as an httpOnly cookie rather than a body field, so a
 * cross-site script cannot read it. The expiry is echoed back so the client
 * can decide what to render without holding the credential itself.
 */
const sendSession = (
  res: Response,
  user: UserDocument,
  status: number
): void => {
  setAuthCookie(res, generateToken(user));

  const body: AuthResponse = {
    id: user._id.toString(),
    user: toUserDTO(user),
    expiresAt: new Date(Date.now() + env.SESSION_MAX_AGE_MS).toISOString(),
  };

  res.status(status).json(body);
};

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

  sendSession(res, user, 201);
});

// POST /api/v1/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePasswords(password))) {
    // Deliberately identical for unknown email and wrong password.
    throw AppError.badRequest("Invalid credentials");
  }

  sendSession(res, user, 200);
});

// POST /api/v1/auth/logout
export const logoutUser = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ message: "Logged out" });
});

// GET /api/v1/auth/getUser
export const getUserInfo = asyncHandler(async (req, res) => {
  res.status(200).json(toUserDTO(req.user as UserDocument));
});

// PATCH /api/v1/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body as ProfileInput;
  const user = req.user as UserDocument;

  if (email !== user.email && (await User.exists({ email }))) {
    throw AppError.badRequest("Email is already used");
  }

  user.fullName = fullName;
  user.email = email;
  await user.save();

  res.status(200).json(toUserDTO(user));
});

// PATCH /api/v1/auth/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body as PasswordInput;

  // req.user comes from a `select("-password")` query, so re-read with it.
  const user = await User.findById(req.user?._id);
  if (!user) throw AppError.unauthorized();

  if (!(await user.comparePasswords(currentPassword))) {
    throw AppError.badRequest("Current password is incorrect");
  }

  user.password = newPassword;
  // Retires every token issued before this point, including on other
  // devices; the caller gets a fresh cookie so their own session survives.
  user.tokenVersion += 1;
  await user.save();

  sendSession(res, user, 200);
});

// DELETE /api/v1/auth/profile-image
export const removeProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { profileImageUrl: null },
    { new: true }
  ).select("-password");

  if (!user) throw AppError.unauthorized();

  res.status(200).json(toUserDTO(user));
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
