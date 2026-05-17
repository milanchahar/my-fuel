const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fuelType: {
    type: String,
    enum: ["Diesel", "Petrol", "CNG", "HSD"],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  deliveryTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Out for Delivery", "Delivered"],
    default: "Pending",
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  placedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
