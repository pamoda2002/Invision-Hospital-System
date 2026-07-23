import api from "./api.js";

// ── Staff ──────────────────────────────────────────
export const getAllStaffRequest = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await api.get(`/staff?${params}`);
  return res.data;
};

export const getStaffByIdRequest = async (id) => {
  const res = await api.get(`/staff/${id}`);
  return res.data;
};

export const addStaffRequest = async (data) => {
  const res = await api.post("/staff", data);
  return res.data;
};

export const updateStaffRequest = async (id, data) => {
  const res = await api.put(`/staff/${id}`, data);
  return res.data;
};

export const deleteStaffRequest = async (id) => {
  const res = await api.delete(`/staff/${id}`);
  return res.data;
};

export const getStaffStatsRequest = async () => {
  const res = await api.get("/staff/stats");
  return res.data;
};

// ── Attendance ─────────────────────────────────────
export const getAllAttendanceRequest = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await api.get(`/attendance?${params}`);
  return res.data;
};

export const getAttendanceByStaffRequest = async (staffId, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await api.get(`/attendance/staff/${staffId}?${params}`);
  return res.data;
};

export const getAttendanceByDateRequest = async (date) => {
  const res = await api.get(`/attendance/date/${date}`);
  return res.data;
};

export const markAttendanceRequest = async (data) => {
  const res = await api.post("/attendance", data);
  return res.data;
};

export const updateAttendanceRequest = async (id, data) => {
  const res = await api.put(`/attendance/${id}`, data);
  return res.data;
};

export const getAttendanceSummaryRequest = async (staffId, month, year) => {
  const res = await api.get(`/attendance/staff/${staffId}/summary?month=${month}&year=${year}`);
  return res.data;
};

// ── Leave ──────────────────────────────────────────
export const getAllLeaveRequestsRequest = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await api.get(`/leave?${params}`);
  return res.data;
};

export const getLeaveByStaffRequest = async (staffId) => {
  const res = await api.get(`/leave/staff/${staffId}`);
  return res.data;
};

export const createLeaveRequestRequest = async (data) => {
  const res = await api.post("/leave", data);
  return res.data;
};

export const reviewLeaveRequestRequest = async (id, status, reviewNotes) => {
  const res = await api.put(`/leave/${id}/review`, { status, reviewNotes });
  return res.data;
};

export const cancelLeaveRequestRequest = async (id) => {
  const res = await api.put(`/leave/${id}/cancel`);
  return res.data;
};

export const getLeaveStatsRequest = async () => {
  const res = await api.get("/leave/stats");
  return res.data;
};

// ── Self-Service Attendance ────────────────────────
export const getMyAttendanceTodayRequest = async () => {
  const res = await api.get("/attendance/me/today");
  return res.data;
};

export const checkInSelfRequest = async (data = {}) => {
  const res = await api.post("/attendance/me/check-in", data);
  return res.data;
};

export const checkOutSelfRequest = async (data = {}) => {
  const res = await api.post("/attendance/me/check-out", data);
  return res.data;
};

export const getMyAttendanceHistoryRequest = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
  const res = await api.get(`/attendance/me/history?${params}`);
  return res.data;
};

export const getMyAttendanceSummaryRequest = async (month, year) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (year)  params.append("year", year);
  const res = await api.get(`/attendance/me/summary?${params}`);
  return res.data;
};

// ── Self-Service Leave ─────────────────────────────
export const getMyLeaveRequestsRequest = async () => {
  const res = await api.get("/leave/me");
  return res.data;
};

export const createMyLeaveRequestRequest = async (data) => {
  const res = await api.post("/leave/me", data);
  return res.data;
};

export const cancelMyLeaveRequestRequest = async (id) => {
  const res = await api.put(`/leave/me/${id}/cancel`);
  return res.data;
};
