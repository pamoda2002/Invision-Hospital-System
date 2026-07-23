import api from "./api.js";

const buildParams = ({ startDate, endDate } = {}) => {
  const p = new URLSearchParams();
  if (startDate) p.append("startDate", startDate);
  if (endDate)   p.append("endDate",   endDate);
  return p.toString() ? `?${p}` : "";
};

export const getPatientReportRequest     = (f) => api.get(`/reports/patients${buildParams(f)}`).then(r => r.data);
export const getAppointmentReportRequest = (f) => api.get(`/reports/appointments${buildParams(f)}`).then(r => r.data);
export const getRevenueReportRequest     = (f) => api.get(`/reports/revenue${buildParams(f)}`).then(r => r.data);
export const getPharmacyReportRequest    = (f) => api.get(`/reports/pharmacy${buildParams(f)}`).then(r => r.data);
export const getLaboratoryReportRequest  = (f) => api.get(`/reports/laboratory${buildParams(f)}`).then(r => r.data);
export const getStaffReportRequest       = (f) => api.get(`/reports/staff${buildParams(f)}`).then(r => r.data);
