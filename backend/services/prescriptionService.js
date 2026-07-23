import Prescription from "../models/Prescription.js";
import Medicine from "../models/Medicine.js";
import Doctor from "../models/Doctor.js";
import ApiError from "../utils/ApiError.js";
const populateOptions = [
  { path: "patient", select: "firstName lastName patientId phone" },
  { path: "doctor", select: "firstName lastName doctorId specialization" },
  { path: "medicines.medicine", select: "name genericName dosageForm strength stockQuantity" },
  { path: "dispensedBy", select: "fullName" },
  { path: "cancelledBy", select: "fullName" },
];

export const createPrescription = async (prescriptionData, userId) => {
  const doctor = await Doctor.findOne({ user: userId });
  if (!doctor) {
    throw new ApiError(404, "Doctor profile not found");
  }

  // Enrich each item with the medicine name snapshot
  const enrichedMedicines = await Promise.all(
    prescriptionData.medicines.map(async (item) => {
      // If a medicine _id is provided, validate it and use its name
      if (item.medicine) {
        const medicine = await Medicine.findById(item.medicine);
        if (medicine && medicine.isActive) {
          return { ...item, medicineName: item.medicineName || medicine.name };
        }
      }
      // Otherwise accept free-text medicine name typed by the doctor
      if (!item.medicineName || !item.medicineName.trim()) {
        throw new ApiError(400, "Medicine name is required for each prescription item");
      }
      const { medicine: _id, ...rest } = item;
      return { ...rest, medicineName: item.medicineName.trim() };
    })
  );

  const prescription = await Prescription.create({
    ...prescriptionData,
    medicines: enrichedMedicines,
    doctor: doctor._id,
  });

  return await prescription.populate(populateOptions);
};

export const getAllPrescriptions = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  return await Prescription.find(query)
    .populate(populateOptions)
    .sort({ createdAt: -1 });
};

export const getPrescriptionsByDoctor = async (userId) => {
  const doctor = await Doctor.findOne({ user: userId });
  if (!doctor) {
    return [];
  }

  return await Prescription.find({ doctor: doctor._id })
    .populate(populateOptions)
    .sort({ createdAt: -1 });
};

export const getPrescriptionsByPatient = async (patientId) => {
  return await Prescription.find({ patient: patientId })
    .populate(populateOptions)
    .sort({ createdAt: -1 });
};

export const getPrescriptionById = async (id) => {
  const prescription = await Prescription.findById(id).populate(populateOptions);

  if (!prescription) {
    throw new ApiError(404, "Prescription not found");
  }
  return prescription;
};

export const getPendingPrescriptions = async () => {
  return await Prescription.find({
    status: { $in: ["Pending", "Partially Dispensed"] },
  })
    .populate(populateOptions)
    .sort({ createdAt: 1 });
};

export const dispensePrescription = async (id, userId) => {
  const prescription = await Prescription.findById(id).populate(
    "medicines.medicine"
  );

  if (!prescription) {
    throw new ApiError(404, "Prescription not found");
  }

  if (prescription.status === "Dispensed") {
    throw new ApiError(400, "Prescription has already been dispensed");
  }

  if (prescription.status === "Cancelled") {
    throw new ApiError(400, "Cannot dispense a cancelled prescription");
  }

  // Check stock availability only for items linked to inventory medicines
  for (const item of prescription.medicines) {
    if (!item.medicine) continue; // free-text medicine — no stock to check
    const medicine = await Medicine.findById(item.medicine._id || item.medicine);
    if (!medicine) continue;
    const needed = item.quantity - item.dispensedQuantity;
    if (medicine.stockQuantity < needed) {
      throw new ApiError(
        400,
        `Insufficient stock for ${medicine.name}. Available: ${medicine.stockQuantity}, Required: ${needed}`
      );
    }
  }

  // Deduct stock and mark quantities
  for (const item of prescription.medicines) {
    const needed = item.quantity - item.dispensedQuantity;
    if (item.medicine) {
      await Medicine.findByIdAndUpdate(item.medicine._id || item.medicine, {
        $inc: { stockQuantity: -needed },
      });
    }
    item.dispensedQuantity = item.quantity;
  }

  prescription.status = "Dispensed";
  prescription.dispensedAt = new Date();
  prescription.dispensedBy = userId;
  await prescription.save();

  return await prescription.populate(populateOptions);
};

export const cancelPrescription = async (id, reason, userId) => {
  const prescription = await Prescription.findById(id);

  if (!prescription) {
    throw new ApiError(404, "Prescription not found");
  }

  if (prescription.status === "Dispensed") {
    throw new ApiError(400, "Cannot cancel an already dispensed prescription");
  }

  if (prescription.status === "Cancelled") {
    throw new ApiError(400, "Prescription is already cancelled");
  }

  const updatedPrescription = await Prescription.findByIdAndUpdate(
    id,
    {
      status: "Cancelled",
      cancelledAt: new Date(),
      cancelledBy: userId,
      cancellationReason: reason || "No reason provided",
    },
    { new: true }
  ).populate(populateOptions);

  return updatedPrescription;
};

export const getPrescriptionStats = async () => {
  const total = await Prescription.countDocuments();
  const pending = await Prescription.countDocuments({ status: "Pending" });
  const dispensed = await Prescription.countDocuments({ status: "Dispensed" });
  const cancelled = await Prescription.countDocuments({ status: "Cancelled" });
  const partiallyDispensed = await Prescription.countDocuments({
    status: "Partially Dispensed",
  });

  // Prescriptions in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTotal = await Prescription.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  return {
    total,
    pending,
    dispensed,
    cancelled,
    partiallyDispensed,
    recentTotal,
  };
};
