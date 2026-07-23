import api from "./api.js";

export const createLaboratoryTestRequest = async (testData) => {
  const response = await api.post("/laboratory", testData);
  return response.data;
};

export const getDoctorLaboratoryTestsRequest = async () => {
  const response = await api.get("/laboratory/doctor");
  return response.data;
};

export const getPatientLaboratoryTestsRequest = async (patientId) => {
  const response = await api.get(`/laboratory/patient/${patientId}`);
  return response.data;
};

export const getAllLaboratoryTestsRequest = async () => {
  const response = await api.get("/laboratory");
  return response.data;
};

export const getLaboratoryTestByIdRequest = async (id) => {
  const response = await api.get(`/laboratory/${id}`);
  return response.data;
};

export const updateLaboratoryTestRequest = async (id, testData) => {
  const response = await api.put(`/laboratory/${id}`, testData);
  return response.data;
};

export const collectSampleRequest = async (id) => {
  const response = await api.put(`/laboratory/${id}/collect-sample`);
  return response.data;
};

export const enterTestResultsRequest = async (id, resultsData) => {
  const response = await api.put(`/laboratory/${id}/enter-results`, resultsData);
  return response.data;
};

export const getPendingTestsRequest = async () => {
  const response = await api.get("/laboratory/pending");
  return response.data;
};

export const getTestsByStatusRequest = async (status) => {
  const response = await api.get(`/laboratory/status/${status}`);
  return response.data;
};

export const cancelLaboratoryTestRequest = async (id) => {
  const response = await api.put(`/laboratory/${id}/cancel`);
  return response.data;
};
