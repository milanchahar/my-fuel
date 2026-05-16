import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

const steps = [
  { name: "Pending", icon: "📝", desc: "Order has been placed" },
  { name: "Accepted", icon: "✅", desc: "Order confirmed by seller" },
  { name: "Out for Delivery", icon: "🚚", desc: "Fuel is on the way" },
  { name: "Delivered", icon: "🎉", desc: "Order delivered successfully" },
];

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
      <div className="tracker-page">
        <div className="empty-state">Loading order...</div>
      </div>
    );
  }

  const currentStep = steps.findIndex((s) => s.name === order.status);

  return (
    <div className="tracker-page animate-fadeUp">
      <div className="tracker-head">
        <h1>Order Tracking</h1>
        <span className="id-pill">#{order._id.slice(-8).toUpperCase()}</span>
      </div>

      <div className="card tracker-info">
        <div className="ti-field">
          <div className="ti-label">Fuel Type</div>
          {order.fuelType}
        </div>
        <div className="ti-field">
          <div className="ti-label">Quantity</div>
          {order.quantity} {order.fuelType === "CNG" ? "kg" : "L"}
        </div>
        <div className="ti-field">
          <div className="ti-label">Location</div>
          {order.location}
        </div>
        <div className="ti-field">
          <div className="ti-label">Total Price</div>
          Rs.{order.totalPrice}
        </div>
      </div>

      <div className="stepper">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={step.name} className="step">
              <div className={`step-circle ${done ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                {done ? "✓" : step.icon}
              </div>
              <div>
                <div className={`step-name ${done ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                  {step.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackOrderPage;
