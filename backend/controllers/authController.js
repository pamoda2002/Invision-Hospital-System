import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../services/authService.js";
import { validateLoginInput, validateRegistrationInput } from "../validations/authValidation.js";

export const register = asyncHandler(async (req, res) => {
  const errors = validateRegistrationInput(req.body);

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, "Validation failed", errors);
  }

  const user = await registerUser(req.body, res, { createSession: false });

  res.status(201).json({
    success: true,
    message: "User account created successfully",
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validateLoginInput(req.body);

  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, "Validation failed", errors);
  }

  const user = await loginUser(req.body, res);

  res.status(200).json({
    success: true,
    message: "Login successful",
    user,
  });
});

export const profile = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const logout = asyncHandler(async (_req, res) => {
  logoutUser(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
