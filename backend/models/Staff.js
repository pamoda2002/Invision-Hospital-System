import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema({
  name:         { type: String, trim: true },
  relationship: { type: String, trim: true },
  phone:        { type: String, trim: true },
}, { _id: false });

const staffSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: [
        "Administrator",
        "Doctor",
        "Nurse",
        "Receptionist",
        "Laboratory Staff",
        "Pharmacist",
        "Accountant",
        "Security",
        "Cleaner",
        "IT Staff",
        "Other",
      ],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: [
        "Administration",
        "Medical",
        "Nursing",
        "Laboratory",
        "Pharmacy",
        "Finance",
        "Reception",
        "IT",
        "Security",
        "Housekeeping",
        "Other",
      ],
    },
    designation: {
      type: String,
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Contract", "Intern"],
      default: "Full-Time",
    },
    joinDate: {
      type: Date,
      required: [true, "Join date is required"],
    },
    salary: {
      type: Number,
      min: 0,
    },
    nationalId: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
      type: Date,
    },
    emergencyContact: emergencyContactSchema,
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended", "Resigned"],
      default: "Active",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

staffSchema.pre("validate", async function (next) {
  if (!this.staffId) {
    const lastStaff = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    let nextNum = 1;
    if (lastStaff && lastStaff.staffId) {
      const match = lastStaff.staffId.match(/\d+/);
      if (match) nextNum = parseInt(match[0], 10) + 1;
    }
    this.staffId = `STF${String(nextNum).padStart(5, "0")}`;
  }
  next();
});

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;
