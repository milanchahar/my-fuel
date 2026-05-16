const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");
const Order = require("./models/Order");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    await Order.deleteMany({});

    const salt = await bcrypt.genSalt(10);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@myfuels.com",
      password: await bcrypt.hash("admin123", salt),
      role: "admin",
    });

    const user = await User.create({
      name: "Milan Chahar",
      email: "user@myfuels.com",
      password: await bcrypt.hash("user123", salt),
      role: "user",
    });

    await Order.insertMany([
      {
        userId: user._id,
        fuelType: "Diesel",
        quantity: 50,
        location: "Sector 15, Gurugram",
        deliveryTime: "2026-05-17T10:00",
        status: "Pending",
        totalPrice: 94.5 * 50,
      },
      {
        userId: user._id,
        fuelType: "Petrol",
        quantity: 30,
        location: "MG Road, Delhi",
        deliveryTime: "2026-05-18T14:00",
        status: "Accepted",
        totalPrice: 102.3 * 30,
      },
      {
        userId: user._id,
        fuelType: "CNG",
        quantity: 20,
        location: "Connaught Place, Delhi",
        deliveryTime: "2026-05-19T09:00",
        status: "Delivered",
        totalPrice: 76 * 20,
      },
    ]);

    console.log("Seed complete:");
    console.log("  Admin -> admin@myfuels.com / admin123");
    console.log("  User  -> user@myfuels.com / user123");
    console.log("  3 sample orders created");

    process.exit(0);
  } catch (err) {
    console.log("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
