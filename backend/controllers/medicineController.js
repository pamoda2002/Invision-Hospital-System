import asyncHandler from "../utils/asyncHandler.js";
import {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  updateStock,
  getLowStockMedicines,
  getExpiringMedicines,
  getExpiredMedicines,
  deleteMedicine,
  getMedicineStats,
} from "../services/medicineService.js";

export const addMedicine = asyncHandler(async (req, res) => {
  const medicine = await createMedicine(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: "Medicine added successfully",
    medicine,
  });
});

export const getMedicines = asyncHandler(async (req, res) => {
  const filters = {
    category: req.query.category,
    search: req.query.search,
  };
  const medicines = await getAllMedicines(filters);

  res.status(200).json({
    success: true,
    medicines,
  });
});

export const getMedicine = asyncHandler(async (req, res) => {
  const medicine = await getMedicineById(req.params.id);

  res.status(200).json({
    success: true,
    medicine,
  });
});

export const editMedicine = asyncHandler(async (req, res) => {
  const medicine = await updateMedicine(req.params.id, req.body, req.user._id);

  res.status(200).json({
    success: true,
    message: "Medicine updated successfully",
    medicine,
  });
});

export const adjustStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (quantity === undefined || quantity === null) {
    return res.status(400).json({ success: false, message: "Quantity is required" });
  }
  const medicine = await updateStock(req.params.id, Number(quantity), req.user._id);

  res.status(200).json({
    success: true,
    message: "Stock updated successfully",
    medicine,
  });
});

export const getLowStock = asyncHandler(async (req, res) => {
  const medicines = await getLowStockMedicines();

  res.status(200).json({
    success: true,
    medicines,
  });
});

export const getExpiring = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 90;
  const medicines = await getExpiringMedicines(days);

  res.status(200).json({
    success: true,
    medicines,
  });
});

export const getExpired = asyncHandler(async (req, res) => {
  const medicines = await getExpiredMedicines();

  res.status(200).json({
    success: true,
    medicines,
  });
});

export const removeMedicine = asyncHandler(async (req, res) => {
  await deleteMedicine(req.params.id);

  res.status(200).json({
    success: true,
    message: "Medicine removed successfully",
  });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await getMedicineStats();

  res.status(200).json({
    success: true,
    stats,
  });
});
