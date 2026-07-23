import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    medicineId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Antibiotic",
        "Analgesic",
        "Antiviral",
        "Antifungal",
        "Antihistamine",
        "Antihypertensive",
        "Antidiabetic",
        "Cardiovascular",
        "Gastrointestinal",
        "Respiratory",
        "Vitamin & Supplement",
        "Other",
      ],
    },
    dosageForm: {
      type: String,
      required: [true, "Dosage form is required"],
      enum: ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment", "Drops", "Inhaler", "Other"],
    },
    strength: {
      type: String,
      required: [true, "Strength is required"],
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: [true, "Reorder level is required"],
      min: [0, "Reorder level cannot be negative"],
      default: 10,
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

medicineSchema.pre("validate", async function (next) {
  if (!this.medicineId) {
    const count = await this.constructor.countDocuments();
    this.medicineId = `MED${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
