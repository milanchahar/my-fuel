const Order = require("../models/Order");

const fuelRates = {
  Diesel: 94.5,
  Petrol: 102.3,
  CNG: 76,
  HSD: 91.2,
};

const placeOrder = async (req, res) => {
  try {
    const { fuelType, quantity, location, deliveryTime, lat, lng } = req.body;

    const rate = fuelRates[fuelType];
    if (!rate) {
      return res.status(400).json({ message: "Invalid fuel type" });
    }

    const totalPrice = parseFloat((rate * quantity).toFixed(2));

    const order = await Order.create({
      userId: req.user._id,
      fuelType,
      quantity,
      location,
      deliveryTime,
      totalPrice,
      lat: lat || null,
      lng: lng || null,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ placedAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};

    if (status) filter.status = status;

    let query = Order.find(filter)
      .populate("userId", "name email")
      .sort({ placedAt: -1 });

    let orders = await query;

    if (search) {
      const term = search.toLowerCase();
      orders = orders.filter((o) => {
        const userName = o.userId?.name?.toLowerCase() || "";
        const loc = o.location?.toLowerCase() || "";
        return userName.includes(term) || loc.includes(term);
      });
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus };
