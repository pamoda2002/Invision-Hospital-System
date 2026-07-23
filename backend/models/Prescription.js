import mongoose from "mongoose";

const prescriptionItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    // optional — doctor may type a free-text medicine name not in inventory
  },
  medicineName: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    required: [true, "Dosage is required"],
    trim: true,
  },
  frequency: {
    type: String,
    required: [true, "Frequency is required"],
    trim: true,
  },
  duration: {
    type: String,
    required: [true, "Duration is required"],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  instructions: {
    type: String,
    trim: true,
  },
  dispensedQuantity: {
    type: Number,
    default: 0,
  },
});

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient is required"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
    },
    medicines: {
      type: [prescriptionItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "Prescription must have at least one medicine",
      },
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Partially Dispensed", "Dispensed", "Cancelled"],
      default: "Pending",
    },
    dispensedAt: {
      type: Date,
    },
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

prescriptionSchema.pre("validate", async function (next) {
  if (!this.prescriptionId) {
    const count = await this.constructor.countDocuments();
    this.prescriptionId = `RX${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
