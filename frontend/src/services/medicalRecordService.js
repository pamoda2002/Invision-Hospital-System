import api from "./api.js";

export const addMedicalRecordRequest = async (recordData) => {
  const response = await api.post("/medical-records", recordData);
  return response.data;
};

export const getDoctorMedicalRecordsRequest = async () => {
  const response = await api.get("/medical-records");
  return response.data;
};

export const getPatientMedicalRecordsRequest = async (patientId) => {
  const response = await api.get(`/medical-records/patient/${patientId}`);
  return response.data;
};

export const getMedicalRecordByIdRequest = async (id) => {
  const response = await api.get(`/medical-records/${id}`);
  return response.data;
};

export const updateMedicalRecordRequest = async (id, recordData) => {
  const response = await api.put(`/medical-records/${id}`, recordData);
  return response.data;
};

export const searchMedicalRecordsRequest = async (keyword) => {
  const response = await api.get(`/medical-records/search/${keyword}`);
  return response.data;
};
