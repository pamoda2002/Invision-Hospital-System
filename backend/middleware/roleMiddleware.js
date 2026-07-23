import ApiError from "../utils/ApiError.js";

const authorizeRoles = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authorized"));
    }

    if (req.user.role === "Administrator") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to access this resource"));
    }

    return next();
  };
};

export default authorizeRoles;
