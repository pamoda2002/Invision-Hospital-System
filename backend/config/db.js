import mongoose from "mongoose";
import dns from "dns";

// Force Google DNS so SRV lookups work on networks with restrictive resolvers
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const connectDB = async () => {
  process.env.USE_MEMORY_DB = "false";

  if (!process.env.MONGODB_URI) {
    process.env.USE_MEMORY_DB = "true";
    console.warn("No MONGODB_URI set — using in-memory store.");
    return;
  }

  mongoose.set("strictQuery", true);

  const mongooseOpts = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS:         15000,
    socketTimeoutMS:          45000,
    family:                   4,     // force IPv4
  };

  // Try SRV URI first, fall back to direct connection string
  const uris = [
    { label: "Atlas SRV",    uri: process.env.MONGODB_URI        },
    { label: "Atlas Direct", uri: process.env.MONGODB_URI_DIRECT },
  ].filter((u) => u.uri);

  for (const { label, uri } of uris) {
    try {
      await mongoose.connect(uri, mongooseOpts);
      console.log(`MongoDB connected ✓  (${label})`);
      process.env.USE_MEMORY_DB = "false";
      return;
    } catch (err) {
      console.warn(`[${label}] connection failed: ${err.message}`);
    }
  }

  // All attempts failed
  process.env.USE_MEMORY_DB = "true";
  console.warn("\n⚠  Could not connect to MongoDB Atlas.");
  console.warn("   Running in in-memory mode — data will NOT persist between restarts.\n");
  console.warn("   To fix, do ONE of the following:");
  console.warn("   1. Add your IP to Atlas whitelist → cloud.mongodb.com → Network Access");
  console.warn(`      Your current IP: run: curl https://api.ipify.org`);
  console.warn("   2. Set Atlas to allow all IPs (0.0.0.0/0) for development");
  console.warn("   3. Check MONGODB_URI password is correct in backend/.env\n");
};

export default connectDB;
