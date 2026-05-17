import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      { withCredentials: true }
    );
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      if (user.role === "admin") {
        socket.emit("joinAdmin");
      } else {
        socket.emit("join", user._id || user.id);
      }
    });

    // user listens for their order status changes
    if (user.role !== "admin") {
      socket.on("orderStatusUpdated", (data) => {
        const icons = {
          Accepted: "🔵",
          "Out for Delivery": "🟢",
          Delivered: "✅",
          Pending: "🟡",
        };
        const icon = icons[data.status] || "📦";

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
                maxWidth: 340,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                opacity: t.visible ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}
            >
              <span style={{ fontSize: 20, marginTop: 2 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f8", marginBottom: 4 }}>
                  Order Update
                </div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>
                  {data.message}
                </div>
              </div>
            </div>
          ),
          { duration: 5000, position: "top-right" }
        );
      });
    }

    // admin listens for new orders coming in
    if (user.role === "admin") {
      socket.on("newOrderPlaced", (data) => {
        toast.custom(
          (t) => (
            <div
              style={{
                background: "#13131f",
                border: "1px solid rgba(34,197,94,0.3)",
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
              <span style={{ fontSize: 20, marginTop: 2 }}>⛽</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#f0f0f8", marginBottom: 4 }}>
                  New Order Received
                </div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>
                  {data.message}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                  📍 {data.location?.slice(0, 40)}
                </div>
              </div>
            </div>
          ),
          { duration: 6000, position: "top-right" }
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
