import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const STEPS = [
  { id: "Pending", label: "Pending", desc: "Order placed successfully" },
  { id: "Accepted", label: "Accepted", desc: "Order confirmed by seller" },
  { id: "Out for Delivery", label: "Out for Delivery", desc: "Fuel is on the way" },
  { id: "Delivered", label: "Delivered", desc: "Order delivered successfully" },
];

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
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
      <div className="page animate-fadeUp" style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: "120px 0", color: "#4b5563" }}>
          Loading order...
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.id === order.status);

  const detailRows = [
    { label: "Fuel Type", value: order.fuelType },
    { label: "Quantity", value: `${order.quantity} ${order.fuelType === "CNG" ? "kg" : "L"}` },
    { label: "Location", value: order.location },
    {
      label: "Delivery Time",
      value: new Date(order.deliveryTime).toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
    },
  ];

  return (
    <div className="page animate-fadeUp" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: "2rem",
        alignItems: "start",
      }}>

        <div>
          <div style={{
            display: "flex", alignItems: "center",
            gap: 16, marginBottom: 32,
          }}>
            <button
              onClick={() => navigate("/history")}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#9ca3af",
                padding: "8px 14px", cursor: "pointer",
                fontSize: 13, display: "flex", alignItems: "center", gap: 6,
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
                ORDER TRACKING
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

          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div style={{
              position: "absolute", left: 15, top: 20,
              width: 3, height: "calc(100% - 40px)",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 2,
            }} />

            {STEPS.map((step, index) => {
              const isCompleted = index < currentIndex;
              const isActive = index === currentIndex;

              return (
                <div key={step.id} style={{
                  display: "flex", alignItems: "flex-start",
                  gap: 24, position: "relative",
                  marginBottom: index < STEPS.length - 1 ? 36 : 0,
                }}>
                  <div style={{
                    position: "absolute", left: -17, top: 6,
                    width: 12, height: 12, borderRadius: "50%",
                    background: isCompleted || isActive ? "#f59e0b" : "#1e1e2e",
                    border: isActive ? "3px solid #f59e0b"
                      : isCompleted ? "2px solid #f59e0b"
                      : "2px solid #2a2a3e",
                    boxShadow: isActive ? "0 0 0 6px rgba(245,158,11,0.15)" : "none",
                    transition: "all 0.3s ease",
                    zIndex: 1,
                  }} />

                  <div style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 38, fontWeight: 800, lineHeight: 1,
                    color: isCompleted || isActive ? "#f59e0b" : "#1e1e2e",
                    minWidth: 52, transition: "color 0.3s ease",
                  }}>
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div style={{ paddingTop: 4 }}>
                    <div style={{
                      fontSize: 16,
                      fontWeight: isActive ? 700 : 500,
                      color: isCompleted || isActive ? "#f0f0f8" : "#374151",
                      marginBottom: 4,
                    }}>
                      {step.label}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: isActive ? "#9ca3af" : "#374151",
                    }}>
                      {step.desc}
                    </div>
                    {isActive && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        marginTop: 8,
                        background: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.25)",
                        borderRadius: 50, padding: "4px 12px",
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: "#f59e0b",
                          animation: "pulse-amber 1.5s infinite",
                        }} />
                        <span style={{
                          fontSize: 11, color: "#f59e0b",
                          fontWeight: 600,
                        }}>
                          CURRENT STATUS
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position: "sticky", top: 96 }}>
          <div style={{
            background: "#0f0f1a",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: 24, marginBottom: 16,
          }}>
            <p style={{
              fontSize: 11, letterSpacing: 3,
              color: "#f59e0b", fontWeight: 600,
              textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 20,
            }}>
              <span style={{ width: 16, height: 2, background: "#f59e0b", display: "inline-block" }} />
              ORDER DETAILS
            </p>

            {detailRows.map((item, i) => (
              <div key={item.label} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start",
                paddingBottom: i < detailRows.length - 1 ? 14 : 0,
                marginBottom: i < detailRows.length - 1 ? 14 : 0,
                borderBottom: i < detailRows.length - 1
                  ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: 13, color: "#f0f0f8", fontWeight: 600,
                  textAlign: "right", maxWidth: "55%",
                }}>
                  {item.value}
                </span>
              </div>
            ))}

            <div style={{
              marginTop: 20, paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{
                fontSize: 11, letterSpacing: 2,
                color: "#6b7280", textTransform: "uppercase",
                fontWeight: 600,
              }}>TOTAL PAID</span>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 24, fontWeight: 800, color: "#f0f0f8",
              }}>
                ₹{order.totalPrice?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div style={{
            background: "#0f0f1a",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: "20px 24px",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(245,158,11,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f8" }}>
                Need help with this order?
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                Contact support: info@myfuels.in
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
