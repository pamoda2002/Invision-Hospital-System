import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import bcrypt from "bcrypt";
import { DEFAULT_STAFF_PASSWORD, staffRoleToUserRole } from "../utils/staffAuth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB\n");

  const users = await User.find().select("+password");
  let resetCount = 0;

  for (const user of users) {
    const ok = await bcrypt.compare(DEFAULT_STAFF_PASSWORD, user.password);
    if (!ok) {
      user.password = DEFAULT_STAFF_PASSWORD;
      await user.save();
      resetCount += 1;
      console.log(`Reset password: ${user.email}`);
    }
  }

  const staffWithoutUser = await Staff.find({ $or: [{ user: null }, { user: { $exists: false } }] });
  let createdCount = 0;

  for (const member of staffWithoutUser) {
    const email = member.email.trim().toLowerCase();
    let user = await User.findOne({ $or: [{ email }, { username: email }] });

    if (!user) {
      user = await User.create({
        fullName: `${member.firstName} ${member.lastName}`.trim(),
        username: email,
        email,
        password: DEFAULT_STAFF_PASSWORD,
        role: staffRoleToUserRole(member.role),
        status: member.status === "Inactive" ? "Inactive" : "Active",
      });
      createdCount += 1;
      console.log(`Created login: ${email} (${member.role})`);
    }

    member.user = user._id;
    await member.save();
    console.log(`Linked staff -> user: ${email}`);
  }

  // Link staff where user exists but staff.user is missing
  const unlinkedStaff = await Staff.find({ user: { $exists: true, $ne: null } }).populate("user");
  for (const member of unlinkedStaff) {
    if (member.user) continue;
  }

  const orphanStaff = await Staff.find().populate("user");
  for (const member of orphanStaff) {
    if (member.user) continue;
    const email = member.email.trim().toLowerCase();
    const user = await User.findOne({ $or: [{ email }, { username: email }] });
    if (user) {
      member.user = user._id;
      await member.save();
      console.log(`Re-linked existing user: ${email}`);
    }
  }

  console.log(`\nDone. Passwords reset: ${resetCount}, accounts created: ${createdCount}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
