import ApiError from "../utils/ApiError.js";

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  let message = error.message || "Server error";
  let details = error.details || null;

  if (error.name === "CastError") {
    message = "Resource not found";
  }

  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyValue || {})[0];
    message = `${duplicateField} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
  });
};
