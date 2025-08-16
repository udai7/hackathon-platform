import { connectDB, disconnectDB } from "../src/db/connection";
import mongoose from "mongoose";
import UserModel from "../src/db/models/User";
import HackathonModel from "../src/db/models/Hackathon";
import PaymentModel from "../src/db/models/Payment";
import bcrypt from "bcryptjs";

(async () => {
  try {
    await connectDB();

    console.log(
      "Dropping collections (if they exist): users, hackathons, payments"
    );

    const db = mongoose.connection.db;
    if (!db) throw new Error("No database connection");

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: any) => c.name);

    if (collectionNames.includes("users")) {
      await db.dropCollection("users");
      console.log("Dropped users");
    }
    if (collectionNames.includes("hackathons")) {
      await db.dropCollection("hackathons");
      console.log("Dropped hackathons");
    }
    if (collectionNames.includes("payments")) {
      await db.dropCollection("payments");
      console.log("Dropped payments");
    }

    // Optionally seed admin user from env
    const adminEmail =
      process.env.VITE_ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "admin@hackpub.com";
    const adminPassword =
      process.env.VITE_ADMIN_PASSWORD ||
      process.env.ADMIN_PASSWORD ||
      "admin123";

    const hashed = await bcrypt.hash(adminPassword, 10);
    const admin = new UserModel({
      id: "admin-001",
      name: "Administrator",
      email: adminEmail,
      password: hashed,
      role: "admin",
    });
    await admin.save();
    console.log("Seeded admin user:", adminEmail);

    console.log("Database reset complete");
  } catch (err) {
    console.error("Reset DB failed", err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
})();
