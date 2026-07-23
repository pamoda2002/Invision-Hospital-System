import api from "./api.js";

export const createPrescriptionRequest = async (prescriptionData) => {
  const response = await api.post("/pharmacy/prescriptions", prescriptionData);
  return response.data;
};

export const getAllPrescriptionsRequest = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  const response = await api.get(`/pharmacy/prescriptions?${params.toString()}`);
  return response.data;
};

export const getDoctorPrescriptionsRequest = async () => {
  const response = await api.get("/pharmacy/prescriptions/doctor");
  return response.data;
};

export const getPatientPrescriptionsRequest = async (patientId) => {
  const response = await api.get(`/pharmacy/prescriptions/patient/${patientId}`);
  return response.data;
};

export const getPrescriptionByIdRequest = async (id) => {
  const response = await api.get(`/pharmacy/prescriptions/${id}`);
  return response.data;
};

export const getPendingPrescriptionsRequest = async () => {
  const response = await api.get("/pharmacy/prescriptions/pending");
  return response.data;
};

export const dispensePrescriptionRequest = async (id) => {
  const response = await api.put(`/pharmacy/prescriptions/${id}/dispense`);
  return response.data;
};

export const cancelPrescriptionRequest = async (id, reason) => {
  const response = await api.put(`/pharmacy/prescriptions/${id}/cancel`, { reason });
  return response.data;
};

export const getPrescriptionStatsRequest = async () => {
  const response = await api.get("/pharmacy/prescriptions/stats");
  return response.data;
};
