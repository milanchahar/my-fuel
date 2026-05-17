import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  RiFileListLine, RiGasStationFill, RiTimeLine,
  RiCheckboxCircleLine, RiArrowRightLine,
  RiTruckLine, RiMoneyRupeeCircleLine, RiSearchLine,
} from "react-icons/ri";

const BADGE_MAP = {
  Pending: "badge-pending",
  Accepted: "badge-accepted",
  "Out for Delivery": "badge-delivery",
  Delivered: "badge-delivered",
};

const STATUS_OPTIONS = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/orders/all");
        setOrders(data);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const outForDelivery = orders.filter((o) => o.status === "Out for Delivery").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const recentOrders = orders.slice(0, 5);

  const statCards = [
    {
      icon: RiFileListLine, label: "TOTAL ORDERS",
      value: totalOrders, sub: "All time",
      color: "#f59e0b", valueColor: "#f0f0f8",
      borderLeft: "none", bg: "linear-gradient(135deg, #13131f, #1a1427)",
    },
    {
      icon: RiTimeLine, label: "PENDING",
      value: pendingOrders, sub: "Awaiting action",
      color: "#f59e0b", valueColor: "#f59e0b",
      borderLeft: "3px solid #f59e0b", bg: undefined,
    },
    {
      icon: RiTruckLine, label: "OUT FOR DELIVERY",
      value: outForDelivery, sub: "In transit",
      color: "#22c55e", valueColor: "#22c55e",
      borderLeft: "3px solid #22c55e", bg: undefined,
    },
    {
      icon: RiMoneyRupeeCircleLine, label: "TOTAL REVENUE",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`, sub: "All time earnings",
      color: "#a78bfa", valueColor: "#a78bfa",
      borderLeft: "3px solid #a78bfa", bg: undefined,
      smallValue: true,
    },
  ];

  return (
    <div className="page animate-fadeUp">
      <div style={{ marginBottom: 32 }}>
        <div className="section-label">ADMIN PORTAL</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f0f8" }}>
          Operations Overview
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
          Real-time order management dashboard
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        marginBottom: 40,
      }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="card"
              style={{
                borderLeft: card.borderLeft,
                background: card.bg || undefined,
              }}
            >
              <div style={{ fontSize: 24, color: card.color, marginBottom: 12 }}>
                <Icon />
              </div>
              <p style={{
                fontSize: 11, fontWeight: 600, color: "#6b7280",
                textTransform: "uppercase", letterSpacing: 2, marginBottom: 8,
              }}>
                {card.label}
              </p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: card.smallValue ? 32 : 42,
                fontWeight: 800,
                color: card.valueColor,
                lineHeight: 1,
              }}>
                {loading ? "—" : card.value}
              </p>
              <p style={{ fontSize: 13, color: "#4b5563", marginTop: 8 }}>
                {card.sub}
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 40 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 16,
        }}>
          <div className="section-label" style={{ marginBottom: 0 }}>RECENT ORDERS</div>
          <button
            onClick={() => navigate("/admin")}
            style={{
              background: "none", border: "none", color: "#f59e0b",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            View All
          </button>
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Fuel</th>
                <th>Qty</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}>
                        <div style={{
                          height: 16, borderRadius: 4,
                          background: "linear-gradient(90deg, #13131f 25%, #1a1a2e 50%, #13131f 75%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite",
                        }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "#4b5563", padding: 32 }}>
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td>{o.userId?.name || "Unknown"}</td>
                    <td>{o.fuelType}</td>
                    <td>{o.quantity}</td>
                    <td>{o.location?.length > 20 ? o.location.slice(0, 20) + "..." : o.location}</td>
                    <td>
                      <span className={`badge ${BADGE_MAP[o.status] || ""}`}>{o.status}</span>
                    </td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className="action-select"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="quick-section">
        <div className="section-label">Quick Actions</div>
        <div className="quick-row">
          <div className="card quick-card" onClick={() => navigate("/admin")}
            style={{ borderLeft: "4px solid #22c55e", paddingLeft: 20 }}>
            <div className="qc-icon" style={{ color: "#22c55e" }}><RiFileListLine /></div>
            <div>
              <div className="qc-title">Manage All Orders</div>
              <div className="qc-desc">View, search and update all orders</div>
            </div>
            <div className="qc-arrow"><RiArrowRightLine /></div>
          </div>
          <div className="card quick-card" onClick={() => navigate("/admin")}
            style={{ borderLeft: "4px solid #60a5fa", paddingLeft: 20 }}>
            <div className="qc-icon" style={{ color: "#60a5fa" }}><RiSearchLine /></div>
            <div>
              <div className="qc-title">Search Orders</div>
              <div className="qc-desc">Find orders by customer or location</div>
            </div>
            <div className="qc-arrow"><RiArrowRightLine /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/orders/my");
        setStats({
          total: data.length,
          pending: data.filter((o) => o.status === "Pending").length,
          delivered: data.filter((o) => o.status === "Delivered").length,
        });
      } catch (err) {
        console.log("Failed to fetch orders");
      }
    };
    fetchStats();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page animate-fadeUp">
      <div className="dash-header">
        <div>
          <h1>{greeting}, {user?.name}</h1>
          <p className="sub">Here's your fuel activity overview</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/place-order")}>
          Place New Order
        </button>
      </div>

      <div className="dash-divider" />

      <div className="stats-row">
        <div className="card stat-card stat-card-total">
          <div className="stat-icon"><RiFileListLine /></div>
          <p className="stat-label">Total Orders</p>
          <p className="stat-value">{stats.total}</p>
          <p className="stat-desc">All time orders placed</p>
        </div>
        <div className="card stat-card stat-card-pending">
          <div className="stat-icon"><RiTimeLine /></div>
          <p className="stat-label">Pending</p>
          <p className="stat-value">{stats.pending}</p>
          <p className="stat-desc">Awaiting confirmation</p>
        </div>
        <div className="card stat-card stat-card-delivered">
          <div className="stat-icon"><RiCheckboxCircleLine /></div>
          <p className="stat-label">Delivered</p>
          <p className="stat-value">{stats.delivered}</p>
          <p className="stat-desc">Successfully completed</p>
        </div>
      </div>

      <div className="quick-section">
        <div className="section-label">Quick Actions</div>
        <div className="quick-row">
          <div className="card quick-card quick-card-amber" onClick={() => navigate("/place-order")}>
            <div className="qc-icon"><RiGasStationFill /></div>
            <div>
              <div className="qc-title">Place New Order</div>
              <div className="qc-desc">Order fuel delivery to your location</div>
            </div>
            <div className="qc-arrow"><RiArrowRightLine /></div>
          </div>
          <div className="card quick-card quick-card-blue" onClick={() => navigate("/history")}>
            <div className="qc-icon"><RiFileListLine /></div>
            <div>
              <div className="qc-title">View History</div>
              <div className="qc-desc">Track and review past orders</div>
            </div>
            <div className="qc-arrow"><RiArrowRightLine /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  return <UserDashboard />;
};

export default DashboardPage;
