import jwt, { type JwtPayload } from "jsonwebtoken";
import type { RequestHandler } from "express";
import User from "../models/User";
import { env } from "../config/env";
import { AUTH_COOKIE } from "../utils/authCookie";

export const protect: RequestHandler = async (req, res, next) => {
  // The browser sends the httpOnly cookie; the bearer header stays supported
  // for non-browser clients.
  const token =
    (req.cookies?.[AUTH_COOKIE] as string | undefined) ??
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.id).select("-password");

    // The token can outlive the account it points at.
    if (!user) {
      res.status(401).json({ message: "Not authorized, user not found" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
