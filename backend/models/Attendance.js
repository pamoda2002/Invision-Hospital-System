import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: [true, "Staff is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    checkIn: {
      type: String, // HH:MM format
      trim: true,
    },
    checkOut: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Half Day", "On Leave"],
      required: [true, "Status is required"],
      default: "Present",
    },
    workHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// One record per staff per day
attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
