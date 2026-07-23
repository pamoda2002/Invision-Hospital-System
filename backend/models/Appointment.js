import mongoose from "mongoose";

const APPOINTMENT_STATUSES = [
  "Scheduled",
  "Completed",
  "Cancelled",
  "No Show",
];

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
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
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    appointmentTime: {
      type: String,
      required: [true, "Appointment time is required"],
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    reason: {
      type: String,
      required: [true, "Reason for visit is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: "Scheduled",
      required: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.pre("validate", async function (next) {
  if (!this.appointmentId) {
    const count = await this.constructor.countDocuments();
    this.appointmentId = `APT${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
