import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { clearAuthCookie, sendAuthCookie, signAuthToken } from "../utils/token.js";
import {
  createMemoryUser,
  findMemoryUserByEmailOrUsername,
  findMemoryUserByEmailOrUsernameForRegistration,
  getMemoryUserById,
} from "../utils/memoryAuthStore.js";

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const isUsingMemoryDb = () => process.env.USE_MEMORY_DB === "true";

export const registerUser = async (payload, res, { createSession = false } = {}) => {
  const { fullName, username, email, password, role, rememberMe = false } = payload;

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  if (isUsingMemoryDb()) {
    const duplicateUser = findMemoryUserByEmailOrUsernameForRegistration(normalizedEmail, normalizedUsername);

    if (duplicateUser) {
      if (duplicateUser.email === normalizedEmail) {
        throw new ApiError(409, "Email already exists");
      }

      throw new ApiError(409, "Username already exists");
    }

    const user = createMemoryUser({
      fullName,
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      role,
    });

    const token = signAuthToken(user._id);
    if (createSession) {
      sendAuthCookie(res, token, rememberMe);
    }

    return sanitizeUser(user);
  }

  const duplicateUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (duplicateUser) {
    if (duplicateUser.email === normalizedEmail) {
      throw new ApiError(409, "Email already exists");
    }

    throw new ApiError(409, "Username already exists");
  }

  const user = await User.create({
    fullName,
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    role,
    status: "Active",
  });

  const token = signAuthToken(user._id);
  if (createSession) {
    sendAuthCookie(res, token, rememberMe);
  }

  return sanitizeUser(user);
};

export const loginUser = async (payload, res) => {
  const { identifier, password, rememberMe = false } = payload;
  const normalizedIdentifier = identifier.trim().toLowerCase();

  if (isUsingMemoryDb()) {
    const user = findMemoryUserByEmailOrUsername(normalizedIdentifier);

    if (!user) {
      throw new ApiError(401, "Incorrect login credentials");
    }

    if (user.status !== "Active") {
      throw new ApiError(403, "Your account is inactive");
    }

    if (user.password !== password) {
      throw new ApiError(401, "Incorrect login credentials");
    }

    const token = signAuthToken(user._id);
    sendAuthCookie(res, token, rememberMe);

    return sanitizeUser(user);
  }

  const user = await User.findOne({
    $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Incorrect login credentials");
  }

  if (user.status !== "Active") {
    throw new ApiError(403, "Your account is inactive");
  }

  const isPasswordValid = await user.matchPassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect login credentials");
  }

  const token = signAuthToken(user._id);
  sendAuthCookie(res, token, rememberMe);

  return sanitizeUser(user);
};

export const getCurrentUser = async (userId) => {
  if (isUsingMemoryDb()) {
    const user = getMemoryUserById(userId);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    return sanitizeUser(user);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  return sanitizeUser(user);
};

export const logoutUser = (res) => {
  clearAuthCookie(res);
};
