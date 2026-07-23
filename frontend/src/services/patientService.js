import api from "./api.js";

export const registerPatientRequest = async (patientData) => {
  const response = await api.post("/receptionist/patients", patientData);
  return response.data;
};

export const getAllPatientsRequest = async () => {
  const response = await api.get("/receptionist/patients");
  return response.data;
};

export const getPatientByIdRequest = async (id) => {
  const response = await api.get(`/receptionist/patients/${id}`);
  return response.data;
};

export const updatePatientRequest = async (id, patientData) => {
  const response = await api.put(`/receptionist/patients/${id}`, patientData);
  return response.data;
};

export const searchPatientsRequest = async (keyword) => {
  const response = await api.get(`/receptionist/patients/search/${keyword}`);
  return response.data;
};
