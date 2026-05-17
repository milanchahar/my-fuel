import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { RiCheckboxCircleLine } from "react-icons/ri";

const steps = [
  { name: "Pending", num: "01", desc: "Order has been placed" },
  { name: "Accepted", num: "02", desc: "Order confirmed by seller" },
  { name: "Out for Delivery", num: "03", desc: "Fuel is on the way" },
  { name: "Delivered", num: "04", desc: "Order delivered successfully" },
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
          ₹{order.totalPrice}
        </div>
      </div>

      <div className="section-label" style={{ marginBottom: 24 }}>Delivery Progress</div>

      <div className="timeline">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={step.name} className="timeline-step">
              <div className={`timeline-step-number ${done ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                {done ? <RiCheckboxCircleLine style={{ fontSize: 28 }} /> : step.num}
              </div>
              <div className={`timeline-step-dot ${done ? "done" : ""} ${isCurrent ? "current" : ""}`} />
              <div className={`timeline-step-title ${done ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                {step.name}
              </div>
              <div className="timeline-step-desc">{step.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackOrderPage;
