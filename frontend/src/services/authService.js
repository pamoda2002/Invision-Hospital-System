import api from "./api.js";

export const loginRequest = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const profileRequest = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const logoutRequest = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};
