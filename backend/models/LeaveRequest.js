import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    leaveId: {
      type: String,
      required: true,
      unique: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: [true, "Staff is required"],
    },
    leaveType: {
      type: String,
      required: [true, "Leave type is required"],
      enum: ["Annual", "Sick", "Maternity", "Paternity", "Emergency", "Unpaid", "Other"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
      trim: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

leaveRequestSchema.pre("validate", async function (next) {
  if (!this.leaveId) {
    const lastLeave = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextNum = 1;
    if (lastLeave && lastLeave.leaveId) {
      const match = lastLeave.leaveId.match(/\d+/);
      if (match) nextNum = parseInt(match[0], 10) + 1;
    }
    this.leaveId = `LV${String(nextNum).padStart(5, "0")}`;
  }
  next();
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
export default LeaveRequest;
