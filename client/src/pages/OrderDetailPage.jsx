import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const fuelRates = {
  Diesel: 94.5,
  Petrol: 102.3,
  CNG: 76,
  HSD: 91.2,
};

const BADGE_STYLES = {
  Pending: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  Accepted: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "rgba(96,165,250,0.3)" },
  "Out for Delivery": { bg: "rgba(34,197,94,0.12)", color: "#22c55e", border: "rgba(34,197,94,0.3)" },
  Delivered: { bg: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "rgba(167,139,250,0.3)" },
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get(`/orders/${orderId}`);
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="page animate-fadeUp" style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: "120px 0", color: "#4b5563" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page animate-fadeUp" style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: "120px 0" }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Order not found</h2>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>This order doesn't exist or you don't have access.</p>
          <button className="btn-primary" onClick={() => navigate("/history")}>
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const rate = fuelRates[order.fuelType] || 0;
  const subtotal = rate * order.quantity;
  const deliveryCharge = 0;
  const badge = BADGE_STYLES[order.status] || BADGE_STYLES.Pending;

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="page animate-fadeUp" style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <button
          onClick={() => navigate("/history")}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, color: "#9ca3af",
            padding: "8px 14px", cursor: "pointer",
            fontSize: 13,
          }}
        >
          &larr; Back
        </button>
        <div>
          <p style={{
            fontSize: 11, letterSpacing: 3,
            color: "#f59e0b", fontWeight: 600,
            textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 16, height: 2, background: "#f59e0b", display: "inline-block" }} />
            ORDER RECEIPT
          </p>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 26, fontWeight: 800,
            color: "#f0f0f8", marginTop: 4,
          }}>
            #{order._id.slice(-8).toUpperCase()}
          </h1>
        </div>
      </div>

      <div style={{
        background: "#0f0f1a",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16, padding: 28, marginBottom: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Status</span>
          <span style={{
            padding: "5px 14px", borderRadius: 50,
            fontSize: 12, fontWeight: 600,
            background: badge.bg, color: badge.color,
            border: `1px solid ${badge.border}`,
          }}>
            {order.status}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 40px" }}>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>
              Fuel Type
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f8" }}>
              {order.fuelType}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>
              Quantity
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f8" }}>
              {order.quantity} {order.fuelType === "CNG" ? "kg" : "L"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>
              Scheduled Delivery
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f8" }}>
              {formatDate(order.deliveryTime)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>
              Placed On
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f8" }}>
              {formatDate(order.placedAt || order.createdAt)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>
            Delivery Location
          </div>
          <div style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.5 }}>
            {order.location}
          </div>
        </div>
      </div>

      <div style={{
        background: "#0f0f1a",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16, padding: 28,
      }}>
        <p style={{
          fontSize: 11, letterSpacing: 3,
          color: "#f59e0b", fontWeight: 600,
          textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 20,
        }}>
          <span style={{ width: 16, height: 2, background: "#f59e0b", display: "inline-block" }} />
          PRICE BREAKDOWN
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
          <span style={{ color: "#6b7280" }}>Unit Price ({order.fuelType})</span>
          <span style={{ color: "#f0f0f8" }}>₹{rate.toFixed(2)} / {order.fuelType === "CNG" ? "kg" : "L"}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
          <span style={{ color: "#6b7280" }}>Subtotal ({order.quantity} x ₹{rate})</span>
          <span style={{ color: "#f0f0f8" }}>₹{subtotal.toLocaleString("en-IN")}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 14 }}>
          <span style={{ color: "#6b7280" }}>Delivery Charges</span>
          <span style={{ color: "#22c55e" }}>Free</span>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 16,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{
            fontSize: 11, letterSpacing: 2,
            color: "#6b7280", textTransform: "uppercase", fontWeight: 600,
          }}>Total</span>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 28, fontWeight: 800, color: "#f0f0f8",
          }}>
            ₹{order.totalPrice?.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button
          className="btn-primary"
          style={{ flex: 1, justifyContent: "center" }}
          onClick={() => navigate(`/track/${order._id}`)}
        >
          Track Order
        </button>
        <button
          className="btn-secondary"
          style={{ flex: 1, justifyContent: "center" }}
          onClick={() => navigate("/history")}
        >
          All Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetailPage;
