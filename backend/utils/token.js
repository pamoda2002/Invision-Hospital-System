import jwt from "jsonwebtoken";

const COOKIE_NAME = "hms_auth";

const getCookieOptions = (rememberMe = false) => {
  const maxAge = rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24 * 7;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge,
    path: "/",
  };
};

export const signAuthToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const sendAuthCookie = (res, token, rememberMe = false) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions(rememberMe));
};

export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
  });
};

export const getTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
};
