import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import bcrypt from "bcrypt";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const email = process.argv[2];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB\n");

  const users = await User.find().select("email username role status");
  console.log(`Users (${users.length}):`);
  users.forEach((u) => console.log(`  - ${u.email} | ${u.username} | ${u.role} | ${u.status}`));

  const staff = await Staff.find().populate("user", "email");
  console.log(`\nStaff (${staff.length}):`);
  staff.forEach((s) => {
    console.log(`  - ${s.email} | ${s.role} | user: ${s.user?.email || "NONE"}`);
  });

  if (email) {
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }],
    }).select("+password");
    console.log(`\nLookup "${email}":`, user ? "found" : "NOT FOUND");
    if (user) {
      console.log("  role:", user.role, "| status:", user.status);
      console.log("  12345678:", await bcrypt.compare("12345678", user.password));
      console.log("  password123:", await bcrypt.compare("password123", user.password));
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
