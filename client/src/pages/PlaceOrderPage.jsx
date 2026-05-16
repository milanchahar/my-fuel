import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const rates = {
  Diesel: 94.5,
  Petrol: 102.3,
  CNG: 76,
  HSD: 91.2,
};

const PlaceOrderPage = () => {
  const [fuelType, setFuelType] = useState("Diesel");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const totalPrice = quantity > 0 ? (rates[fuelType] * quantity).toFixed(2) : "0.00";
  const unit = fuelType === "CNG" ? "kg" : "L";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/orders", { fuelType, quantity, location, deliveryTime });
      toast.success("Order placed successfully");
      navigate("/history");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Place New Order</h1>
      <p className="page-subtitle">Fill in the details below</p>

      <form onSubmit={handleSubmit} className="form-box" style={{ maxWidth: 520 }}>
        <label>Fuel Type</label>
        <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
          <option>Diesel</option>
          <option>Petrol</option>
          <option>CNG</option>
          <option>HSD</option>
        </select>

        <label>Quantity ({unit})</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity"
          required
        />

        <label>Delivery Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter delivery address"
          required
        />

        <label>Preferred Delivery Time</label>
        <input
          type="datetime-local"
          value={deliveryTime}
          onChange={(e) => setDeliveryTime(e.target.value)}
          required
        />

        <div className="price-preview">
          <span className="price-label">
            {quantity > 0
              ? `${quantity} ${unit} x Rs.${rates[fuelType]}/${unit}`
              : "Enter quantity to see price"}
          </span>
          <span className="price-value">Rs.{totalPrice}</span>
        </div>

        <button type="submit" disabled={loading} className="btn">
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
};

export default PlaceOrderPage;
