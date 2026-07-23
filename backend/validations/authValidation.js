import { USER_ROLES } from "../models/User.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRequired = (value) => typeof value === "string" && value.trim().length > 0;

export const validateRegistrationInput = (data = {}) => {
  const errors = {};
  const fullName = data.fullName?.trim();
  const username = data.username?.trim();
  const email = data.email?.trim();
  const password = data.password ?? "";
  const confirmPassword = data.confirmPassword ?? "";
  const role = data.role?.trim();

  if (!validateRequired(fullName)) {
    errors.fullName = "Full name is required";
  }

  if (!validateRequired(username)) {
    errors.username = "Username is required";
  }

  if (!validateRequired(email)) {
    errors.email = "Email address is required";
  } else if (!emailRegex.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (!validateRequired(password)) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!validateRequired(confirmPassword)) {
    errors.confirmPassword = "Confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!validateRequired(role)) {
    errors.role = "Please select a role";
  } else if (!USER_ROLES.includes(role)) {
    errors.role = "Selected role is not valid";
  }

  return errors;
};

export const validateLoginInput = (data = {}) => {
  const errors = {};
  const identifier = data.identifier?.trim();
  const password = data.password ?? "";

  if (!validateRequired(identifier)) {
    errors.identifier = "Email or username is required";
  }

  if (!validateRequired(password)) {
    errors.password = "Password is required";
  }

  return errors;
};
