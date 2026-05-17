import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const fuels = [
  { name: "Diesel", dotColor: "#f59e0b", rate: 94.5, unit: "L" },
  { name: "Petrol", dotColor: "#ef4444", rate: 102.3, unit: "L" },
  { name: "CNG", dotColor: "#22c55e", rate: 76, unit: "kg" },
  { name: "HSD", dotColor: "#3b82f6", rate: 91.2, unit: "L" },
];

const PlaceOrderPage = () => {
  const [fuelType, setFuelType] = useState("Diesel");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const selected = fuels.find((f) => f.name === fuelType);
  const total = quantity > 0 ? (selected.rate * quantity).toFixed(2) : "0.00";

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
    <div className="page animate-fadeUp">
      <div className="section-label">New Order</div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Place Fuel Order</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Select fuel type and fill in delivery details</p>

      <form onSubmit={handleSubmit}>
        <div className="order-layout">
          <div>
            <label className="label">Fuel Type</label>
            <div className="fuel-grid">
              {fuels.map((f) => (
                <div key={f.name}
                  className={`fuel-card ${fuelType === f.name ? "selected" : ""}`}
                  onClick={() => setFuelType(f.name)}>
                  <span className="fuel-dot" style={{ background: f.dotColor }} />
                  <div className="fc-name">{f.name}</div>
                  <div className="fc-rate">₹{f.rate}/{f.unit}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="label">Quantity ({selected.unit})</label>
              <input type="number" min="1" value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity" required className="input" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="label">Delivery Location</label>
              <input type="text" value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter delivery address" required className="input" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="label">Preferred Delivery Time</label>
              <input type="datetime-local" value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                required className="input" />
            </div>
          </div>

          <div className="card summary-card">
            <div className="section-label">Order Summary</div>
            <div className="summary-row">
              <span className="sr-label">Fuel Type</span>
              <span className="sr-value">{fuelType}</span>
            </div>
            <div className="summary-row">
              <span className="sr-label">Quantity</span>
              <span className="sr-value">{quantity || 0} {selected.unit}</span>
            </div>
            <div className="summary-row">
              <span className="sr-label">Unit Price</span>
              <span className="sr-value">₹{selected.rate}/{selected.unit}</span>
            </div>
            <div className="divider"></div>
            <div className="summary-total-label">Total</div>
            <div className="summary-total">₹{total}</div>
            <div className="summary-note">incl. delivery charges</div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? "Placing Order..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrderPage;
