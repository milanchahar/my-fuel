import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const statusColors = {
  Pending: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  Accepted: { bg: "rgba(96,165,250,0.15)", color: "#60a5fa", border: "rgba(96,165,250,0.3)" },
  "Out for Delivery": { bg: "rgba(34,197,94,0.15)", color: "#22c55e", border: "rgba(34,197,94,0.3)" },
  Delivered: { bg: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "rgba(167,139,250,0.3)" },
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5001",
      { withCredentials: true }
    );
    socketRef.current = socket;

    socket.on("connect", () => {
      if (user.role === "admin") {
        socket.emit("joinAdmin");
      } else {
        socket.emit("join", user._id || user.id);
      }
    });

    if (user.role !== "admin") {
      socket.on("orderStatusUpdated", (data) => {
        const sc = statusColors[data.status] || statusColors.Pending;

        toast.custom(
          (t) => (
            <div
              style={{
                background: "#13131f",
                border: `1px solid ${sc.border}`,
                borderRadius: 12,
                padding: "14px 18px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                maxWidth: 340,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                opacity: t.visible ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: sc.color, marginTop: 5, flexShrink: 0,
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f8", marginBottom: 4 }}>
                  Order #{data.shortId}
                </div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>
                  {data.message}
                </div>
              </div>
            </div>
          ),
          { duration: 4000, position: "top-right" }
        );
      });
    }

    if (user.role === "admin") {
      socket.on("newOrderPlaced", (data) => {
        toast.custom(
          (t) => (
            <div
              style={{
                background: "#13131f",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 12,
                padding: "14px 18px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                maxWidth: 360,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                opacity: t.visible ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: "#f59e0b", marginTop: 5, flexShrink: 0,
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f8", marginBottom: 4 }}>
                  New Order
                </div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>
                  {data.message}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                  {data.location?.slice(0, 40)}
                </div>
              </div>
            </div>
          ),
          { duration: 4000, position: "top-right" }
        );
      });
    }

    return () => socket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
