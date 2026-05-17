const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const setupSocket = require("./socket");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

app.set("io", io);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error(err));
