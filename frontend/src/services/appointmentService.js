import api from "./api.js";

export const bookAppointmentRequest = async (appointmentData) => {
  const response = await api.post("/appointments", appointmentData);
  return response.data;
};

export const getAllAppointmentsRequest = async () => {
  const response = await api.get("/appointments");
  return response.data;
};

export const getAppointmentByIdRequest = async (id) => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

export const updateAppointmentRequest = async (id, appointmentData) => {
  const response = await api.put(`/appointments/${id}`, appointmentData);
  return response.data;
};

export const searchAppointmentsRequest = async (keyword) => {
  const response = await api.get(`/appointments/search/${keyword}`);
  return response.data;
};
