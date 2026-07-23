import asyncHandler from "../utils/asyncHandler.js";
import {
  getPatientReport,
  getAppointmentReport,
  getRevenueReport,
  getPharmacyReport,
  getLaboratoryReport,
  getStaffReport,
} from "../services/reportsService.js";

const extractDates = (query) => ({
  startDate: query.startDate || null,
  endDate:   query.endDate   || null,
});

export const patientReport = asyncHandler(async (req, res) => {
  const data = await getPatientReport(extractDates(req.query));
  res.status(200).json({ success: true, report: data });
});

export const appointmentReport = asyncHandler(async (req, res) => {
  const data = await getAppointmentReport(extractDates(req.query));
  res.status(200).json({ success: true, report: data });
});

export const revenueReport = asyncHandler(async (req, res) => {
  const data = await getRevenueReport(extractDates(req.query));
  res.status(200).json({ success: true, report: data });
});

export const pharmacyReport = asyncHandler(async (req, res) => {
  const data = await getPharmacyReport(extractDates(req.query));
  res.status(200).json({ success: true, report: data });
});

export const laboratoryReport = asyncHandler(async (req, res) => {
  const data = await getLaboratoryReport(extractDates(req.query));
  res.status(200).json({ success: true, report: data });
});

export const staffReport = asyncHandler(async (req, res) => {
  const data = await getStaffReport(extractDates(req.query));
  res.status(200).json({ success: true, report: data });
});
