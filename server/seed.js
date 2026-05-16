const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const salt = await bcrypt.genSalt(10);

    const demoUser = {
      name: "Milan",
      email: "milan@test.com",
      password: await bcrypt.hash("123456", salt),
      role: "user",
    };

    const adminUser = {
      name: "Admin",
      email: "admin@test.com",
      password: await bcrypt.hash("admin123", salt),
      role: "admin",
    };

    await User.deleteMany({ email: { $in: ["milan@test.com", "admin@test.com"] } });
    await User.insertMany([demoUser, adminUser]);

    console.log("Demo users created:");
    console.log("  User  -> milan@test.com / 123456");
    console.log("  Admin -> admin@test.com / admin123");

    process.exit(0);
  } catch (err) {
    console.log("Error:", err.message);
    process.exit(1);
  }
};

seedUsers();
