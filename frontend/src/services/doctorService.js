import api from "./api.js";

export const addDoctorRequest = async (doctorData) => {
  const response = await api.post("/admin/doctors", doctorData);
  return response.data;
};

export const getAllDoctorsRequest = async () => {
  const response = await api.get("/admin/doctors");
  return response.data;
};

export const getDoctorByIdRequest = async (id) => {
  const response = await api.get(`/admin/doctors/${id}`);
  return response.data;
};

export const updateDoctorRequest = async (id, doctorData) => {
  const response = await api.put(`/admin/doctors/${id}`, doctorData);
  return response.data;
};

export const searchDoctorsRequest = async (keyword) => {
  const response = await api.get(`/admin/doctors/search/${keyword}`);
  return response.data;
};
