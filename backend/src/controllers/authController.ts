import jwt from "jsonwebtoken";
import type { Response } from "express";
import type { AuthResponse, User as UserDTO } from "@shared/types";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie";
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
  setAuthCookie(res, generateToken(user._id.toString()));

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
