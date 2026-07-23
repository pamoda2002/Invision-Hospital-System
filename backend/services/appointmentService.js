import Appointment from "../models/Appointment.js";
import ApiError from "../utils/ApiError.js";

export const createAppointment = async (appointmentData, userId) => {
  const appointment = await Appointment.create({
    ...appointmentData,
    bookedBy: userId,
  });

  // Populate patient and doctor for response
  return await appointment.populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization department" },
    { path: "bookedBy", select: "fullName username" },
  ]);
};

export const getAllAppointments = async () => {
  const appointments = await Appointment.find()
    .populate([
      { path: "patient", select: "firstName lastName patientId" },
      { path: "doctor", select: "firstName lastName doctorId specialization department" },
      { path: "bookedBy", select: "fullName username" },
    ])
    .sort({ appointmentDate: -1, appointmentTime: -1 });
  return appointments;
};

export const getAppointmentsByDoctor = async (doctorId) => {
  const appointments = await Appointment.find({ doctor: doctorId })
    .populate([
      { path: "patient", select: "firstName lastName patientId" },
      { path: "doctor", select: "firstName lastName doctorId specialization department" },
      { path: "bookedBy", select: "fullName username" },
    ])
    .sort({ appointmentDate: -1, appointmentTime: -1 });
  return appointments;
};

export const getAppointmentById = async (id) => {
  const appointment = await Appointment.findById(id).populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization department" },
    { path: "bookedBy", select: "fullName username" },
  ]);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }
  return appointment;
};

export const updateAppointment = async (id, appointmentData) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(id, appointmentData, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "patient", select: "firstName lastName patientId" },
    { path: "doctor", select: "firstName lastName doctorId specialization department" },
    { path: "bookedBy", select: "fullName username" },
  ]);

  return updatedAppointment;
};

export const searchAppointments = async (keyword) => {
  const searchQuery = {
    $or: [
      { appointmentId: { $regex: keyword, $options: "i" } },
      { reason: { $regex: keyword, $options: "i" } },
    ],
  };

  const appointments = await Appointment.find(searchQuery)
    .populate([
      { path: "patient", select: "firstName lastName patientId" },
      { path: "doctor", select: "firstName lastName doctorId specialization department" },
      { path: "bookedBy", select: "fullName username" },
    ])
    .sort({ appointmentDate: -1, appointmentTime: -1 });
  return appointments;
};
