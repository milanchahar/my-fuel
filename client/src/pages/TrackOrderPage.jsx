import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

const steps = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get("/orders/my");
        const found = data.find((o) => o._id === orderId);
        setOrder(found || null);
      } catch (err) {
        console.log("Failed to fetch order");
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <div className="page">
        <div className="empty-state">Loading order...</div>
      </div>
    );
  }

  const currentStep = steps.indexOf(order.status);

  return (
    <div className="page">
      <h1 className="page-title">Track Order</h1>
      <p className="page-subtitle">Order #{order._id.slice(-8).toUpperCase()}</p>

      <div className="tracker-wrap">
        <div className="tracker-detail">
          <div className="field">
            <span>Fuel Type</span>
            {order.fuelType}
          </div>
          <div className="field">
            <span>Quantity</span>
            {order.quantity} {order.fuelType === "CNG" ? "kg" : "L"}
          </div>
          <div className="field">
            <span>Location</span>
            {order.location}
          </div>
          <div className="field">
            <span>Total Price</span>
            Rs.{order.totalPrice}
          </div>
        </div>

        <div className="progress-bar">
          {steps.map((step, i) => (
            <div key={step} className="progress-step">
              <div className={`step-dot ${i <= currentStep ? "done" : ""}`}>
                {i <= currentStep ? "✓" : i + 1}
              </div>
              <span className={`step-label ${i <= currentStep ? "done" : ""}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
