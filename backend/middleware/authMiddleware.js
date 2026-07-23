import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { getTokenFromRequest } from "../utils/token.js";

export const protect = async (req, _res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new ApiError(401, "Not authorized, token missing");
    }

    if (!process.env.JWT_SECRET) {
      throw new ApiError(500, "JWT secret is not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new ApiError(401, "Not authorized, user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
