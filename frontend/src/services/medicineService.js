import api from "./api.js";

export const getAllMedicinesRequest = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.search) params.append("search", filters.search);
  const response = await api.get(`/pharmacy/medicines?${params.toString()}`);
  return response.data;
};

export const getMedicineByIdRequest = async (id) => {
  const response = await api.get(`/pharmacy/medicines/${id}`);
  return response.data;
};

export const addMedicineRequest = async (medicineData) => {
  const response = await api.post("/pharmacy/medicines", medicineData);
  return response.data;
};

export const updateMedicineRequest = async (id, medicineData) => {
  const response = await api.put(`/pharmacy/medicines/${id}`, medicineData);
  return response.data;
};

export const adjustStockRequest = async (id, quantity) => {
  const response = await api.put(`/pharmacy/medicines/${id}/stock`, { quantity });
  return response.data;
};

export const getLowStockRequest = async () => {
  const response = await api.get("/pharmacy/medicines/low-stock");
  return response.data;
};

export const getExpiringMedicinesRequest = async (days = 90) => {
  const response = await api.get(`/pharmacy/medicines/expiring?days=${days}`);
  return response.data;
};

export const getExpiredMedicinesRequest = async () => {
  const response = await api.get("/pharmacy/medicines/expired");
  return response.data;
};

export const deleteMedicineRequest = async (id) => {
  const response = await api.delete(`/pharmacy/medicines/${id}`);
  return response.data;
};

export const getMedicineStatsRequest = async () => {
  const response = await api.get("/pharmacy/medicines/stats");
  return response.data;
};
