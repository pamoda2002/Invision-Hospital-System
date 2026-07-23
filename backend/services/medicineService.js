import Medicine from "../models/Medicine.js";
import ApiError from "../utils/ApiError.js";

export const createMedicine = async (medicineData, userId) => {
  const medicine = await Medicine.create({
    ...medicineData,
    addedBy: userId,
  });

  return await medicine.populate([
    { path: "addedBy", select: "fullName" },
    { path: "lastUpdatedBy", select: "fullName" },
  ]);
};

export const getAllMedicines = async (filters = {}) => {
  const query = { isActive: true };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { genericName: { $regex: filters.search, $options: "i" } },
      { medicineId: { $regex: filters.search, $options: "i" } },
    ];
  }

  return await Medicine.find(query)
    .populate([
      { path: "addedBy", select: "fullName" },
      { path: "lastUpdatedBy", select: "fullName" },
    ])
    .sort({ name: 1 });
};

export const getMedicineById = async (id) => {
  const medicine = await Medicine.findById(id).populate([
    { path: "addedBy", select: "fullName" },
    { path: "lastUpdatedBy", select: "fullName" },
  ]);

  if (!medicine) {
    throw new ApiError(404, "Medicine not found");
  }
  return medicine;
};

export const updateMedicine = async (id, medicineData, userId) => {
  const medicine = await Medicine.findById(id);
  if (!medicine) {
    throw new ApiError(404, "Medicine not found");
  }

  const updatedMedicine = await Medicine.findByIdAndUpdate(
    id,
    {
      ...medicineData,
      lastUpdatedBy: userId,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate([
    { path: "addedBy", select: "fullName" },
    { path: "lastUpdatedBy", select: "fullName" },
  ]);

  return updatedMedicine;
};

export const updateStock = async (id, quantity, userId) => {
  const medicine = await Medicine.findById(id);
  if (!medicine) {
    throw new ApiError(404, "Medicine not found");
  }

  const newStock = medicine.stockQuantity + quantity;
  if (newStock < 0) {
    throw new ApiError(400, "Insufficient stock");
  }

  const updatedMedicine = await Medicine.findByIdAndUpdate(
    id,
    {
      stockQuantity: newStock,
      lastUpdatedBy: userId,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate([
    { path: "addedBy", select: "fullName" },
    { path: "lastUpdatedBy", select: "fullName" },
  ]);

  return updatedMedicine;
};

export const getLowStockMedicines = async () => {
  return await Medicine.find({
    isActive: true,
    $expr: { $lte: ["$stockQuantity", "$reorderLevel"] },
  })
    .populate([
      { path: "addedBy", select: "fullName" },
      { path: "lastUpdatedBy", select: "fullName" },
    ])
    .sort({ stockQuantity: 1 });
};

export const getExpiringMedicines = async (daysThreshold = 90) => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

  return await Medicine.find({
    isActive: true,
    expiryDate: { $lte: thresholdDate },
  })
    .populate([
      { path: "addedBy", select: "fullName" },
      { path: "lastUpdatedBy", select: "fullName" },
    ])
    .sort({ expiryDate: 1 });
};

export const getExpiredMedicines = async () => {
  const now = new Date();

  return await Medicine.find({
    isActive: true,
    expiryDate: { $lt: now },
  })
    .populate([
      { path: "addedBy", select: "fullName" },
      { path: "lastUpdatedBy", select: "fullName" },
    ])
    .sort({ expiryDate: 1 });
};

export const deleteMedicine = async (id) => {
  const medicine = await Medicine.findById(id);
  if (!medicine) {
    throw new ApiError(404, "Medicine not found");
  }

  await Medicine.findByIdAndUpdate(id, { isActive: false });
  return { message: "Medicine deactivated successfully" };
};

export const getMedicineStats = async () => {
  const totalMedicines = await Medicine.countDocuments({ isActive: true });
  const lowStockCount = await Medicine.countDocuments({
    isActive: true,
    $expr: { $lte: ["$stockQuantity", "$reorderLevel"] },
  });

  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + 90);
  const expiringCount = await Medicine.countDocuments({
    isActive: true,
    expiryDate: { $lte: thresholdDate, $gte: new Date() },
  });

  const expiredCount = await Medicine.countDocuments({
    isActive: true,
    expiryDate: { $lt: new Date() },
  });

  const totalValue = await Medicine.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: { $multiply: ["$stockQuantity", "$unitPrice"] } },
      },
    },
  ]);

  return {
    totalMedicines,
    lowStockCount,
    expiringCount,
    expiredCount,
    totalInventoryValue: totalValue[0]?.total || 0,
  };
};
