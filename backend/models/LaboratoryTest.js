import mongoose from "mongoose";

const laboratoryTestSchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      required: true,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    testType: {
      type: String,
      required: [true, "Test type is required"],
      enum: ["Blood Test", "Urine Test", "X-Ray", "MRI", "CT Scan", "ECG", "Ultrasound", "Biopsy", "Other"],
    },
    testName: {
      type: String,
      required: [true, "Test name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Routine", "Urgent", "Emergency"],
      default: "Routine",
    },
    status: {
      type: String,
      enum: ["Pending", "Sample Collected", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    sampleCollectedAt: {
      type: Date,
    },
    sampleCollectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    results: {
      type: String,
      trim: true,
    },
    normalRange: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

laboratoryTestSchema.pre("validate", async function (next) {
  if (!this.testId) {
    const count = await this.constructor.countDocuments();
    this.testId = `LAB${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

const LaboratoryTest = mongoose.model("LaboratoryTest", laboratoryTestSchema);
export default LaboratoryTest;
