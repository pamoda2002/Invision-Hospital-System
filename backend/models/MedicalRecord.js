import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    recordId: {
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
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },
    symptoms: {
      type: String,
      trim: true,
    },
    prescription: {
      type: String,
      trim: true,
    },
    treatmentNotes: {
      type: String,
      trim: true,
    },
    medicalReport: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

medicalRecordSchema.pre("validate", async function (next) {
  if (!this.recordId) {
    const count = await this.constructor.countDocuments();
    this.recordId = `MR${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
export default MedicalRecord;
