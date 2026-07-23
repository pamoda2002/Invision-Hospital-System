import "dotenv/config";
import connectDB from "./config/db.js";
import Staff from "./models/Staff.js";
import User  from "./models/User.js";
import { DEFAULT_STAFF_PASSWORD, staffRoleToUserRole } from "./utils/staffAuth.js";
import bcrypt from "bcrypt";

await connectDB();

const staffList = await Staff.find({}).lean();
console.log(`\nTotal staff in MongoDB: ${staffList.length}\n`);

for (const s of staffList) {
  const email = s.email.trim().toLowerCase();
  let user = await User.findOne({ $or: [{ email }, { username: email }] });

  if (!user) {
    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(DEFAULT_STAFF_PASSWORD, salt);
    user = await User.create({
      fullName: `${s.firstName} ${s.lastName}`,
      username: email,
      email,
      password: hashed,
      role:     staffRoleToUserRole(s.role),
      status:  "Active",
    });
    await Staff.findByIdAndUpdate(s._id, { user: user._id });
    console.log(`✅ CREATED  ${email}  (${s.role})  →  default password: ${DEFAULT_STAFF_PASSWORD}`);
  } else if (!s.user) {
    await Staff.findByIdAndUpdate(s._id, { user: user._id });
    console.log(`🔗 LINKED   ${email}  (user already existed)`);
  } else {
    console.log(`⏭  SKIPPED  ${email}  (already linked)`);
  }
}

console.log("\n✔ Repair complete.\n");
process.exit(0);
