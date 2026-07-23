import express from "express";
import {
  addMedicine,
  getMedicines,
  getMedicine,
  editMedicine,
  adjustStock,
  getLowStock,
  getExpiring,
  getExpired,
  removeMedicine,
  getStats,
} from "../controllers/medicineController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

// Stats and alerts — Pharmacist & Administrator
router.get("/stats", authorizeRoles("Pharmacist", "Administrator"), getStats);
router.get("/low-stock", authorizeRoles("Pharmacist", "Administrator"), getLowStock);
router.get("/expiring", authorizeRoles("Pharmacist", "Administrator"), getExpiring);
router.get("/expired", authorizeRoles("Pharmacist", "Administrator"), getExpired);

// All medicines list — Doctor needs it for prescription form
router.get(
  "/",
  authorizeRoles("Pharmacist", "Administrator", "Doctor"),
  getMedicines
);

// Single medicine — Pharmacist, Administrator, Doctor
router.get(
  "/:id",
  authorizeRoles("Pharmacist", "Administrator", "Doctor"),
  getMedicine
);

// Pharmacist & Administrator — manage inventory
router.post("/", authorizeRoles("Pharmacist", "Administrator"), addMedicine);
router.put("/:id", authorizeRoles("Pharmacist", "Administrator"), editMedicine);
router.put("/:id/stock", authorizeRoles("Pharmacist", "Administrator"), adjustStock);
router.delete("/:id", authorizeRoles("Pharmacist", "Administrator"), removeMedicine);

export default router;
