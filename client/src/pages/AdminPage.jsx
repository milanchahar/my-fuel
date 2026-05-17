import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  RiFileListLine, RiTimeLine, RiTruckLine, RiMoneyRupeeCircleLine,
} from "react-icons/ri";

const STATUS_OPTIONS = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

const BADGE_MAP = {
  Pending: "badge-pending",
  Accepted: "badge-accepted",
  "Out for Delivery": "badge-delivery",
  Delivered: "badge-delivered",
};

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/orders/all");
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      setUpdatingId(orderId);
      setTimeout(() => setUpdatingId(null), 1000);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filtered = orders.filter((order) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      order.userId?.name?.toLowerCase().includes(q) ||
      order.location?.toLowerCase().includes(q) ||
      order._id?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const outForDelivery = orders.filter((o) => o.status === "Out for Delivery").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const shimmerStyle = {
    height: 16,
    borderRadius: 4,
    background: "linear-gradient(90deg, #13131f 25%, #1a1a2e 50%, #13131f 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  };

  return (
    <div className="page-wide animate-fadeUp">
      <div className="section-label">Administration</div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Admin Panel</h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>Manage all fuel orders</p>

      <div className="admin-stats">
        <div className="card stat-card" style={{ background: "linear-gradient(135deg, #13131f, #1a1427)" }}>
          <div className="stat-icon" style={{ color: "#f59e0b" }}><RiFileListLine /></div>
          <p className="stat-label">Total Orders</p>
          <p className="stat-value color-white">{loading ? "—" : totalOrders}</p>
          <p className="stat-desc">All time</p>
        </div>
        <div className="card stat-card" style={{ borderLeft: "3px solid #f59e0b" }}>
          <div className="stat-icon" style={{ color: "#f59e0b" }}><RiTimeLine /></div>
          <p className="stat-label">Pending</p>
          <p className="stat-value color-amber">{loading ? "—" : pendingOrders}</p>
          <p className="stat-desc">Awaiting action</p>
        </div>
        <div className="card stat-card" style={{ borderLeft: "3px solid #22c55e" }}>
          <div className="stat-icon" style={{ color: "#22c55e" }}><RiTruckLine /></div>
          <p className="stat-label">Out for Delivery</p>
          <p className="stat-value" style={{ color: "#22c55e" }}>{loading ? "—" : outForDelivery}</p>
          <p className="stat-desc">In transit</p>
        </div>
        <div className="card stat-card" style={{ borderLeft: "3px solid #a78bfa" }}>
          <div className="stat-icon" style={{ color: "#a78bfa" }}><RiMoneyRupeeCircleLine /></div>
          <p className="stat-label">Total Revenue</p>
          <p className="stat-value" style={{ color: "#a78bfa", fontSize: 32 }}>
            {loading ? "—" : `₹${totalRevenue.toLocaleString("en-IN")}`}
          </p>
          <p className="stat-desc">All time earnings</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, margin: "24px 0", flexWrap: "wrap" }}>
        <input
          placeholder="Search by customer, location, order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ flex: 1, minWidth: 240 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
          style={{ width: 180 }}
        >
          <option>All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12, paddingLeft: 4 }}>
        Showing {filtered.length} of {orders.length} orders
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Fuel</th>
              <th>Qty</th>
              <th>Location</th>
              <th>Total</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j}><div style={shimmerStyle} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", color: "#4b5563", padding: 40 }}>
                  No orders found
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o._id} style={{
                  background: updatingId === o._id ? "rgba(34,197,94,0.05)" : "transparent",
                  transition: "background 0.3s ease",
                }}>
                  <td className="order-id">#{o._id.slice(-8).toUpperCase()}</td>
                  <td>{o.userId?.name || "Unknown"}</td>
                  <td>{o.fuelType}</td>
                  <td>{o.quantity}</td>
                  <td>{o.location?.length > 20 ? o.location.slice(0, 20) + "..." : o.location}</td>
                  <td>₹{(o.totalPrice || 0).toLocaleString("en-IN")}</td>
                  <td>{formatTime(o.deliveryTime)}</td>
                  <td><span className={`badge ${BADGE_MAP[o.status] || ""}`}>{o.status}</span></td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      style={{
                        appearance: "none",
                        background: "#0f0f1a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        color: "#f0f0f8",
                        padding: "7px 32px 7px 12px",
                        fontSize: 12,
                        cursor: "pointer",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 10px center",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
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

      <div className="mobile-orders">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card" style={{ marginBottom: 12, padding: 20 }}>
              <div style={{ ...shimmerStyle, width: "40%", marginBottom: 12 }} />
              <div style={{ ...shimmerStyle, width: "80%", marginBottom: 8 }} />
              <div style={{ ...shimmerStyle, width: "60%" }} />
            </div>
          ))
        ) : (
          filtered.map((o) => (
            <div key={o._id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: "monospace", color: "#f59e0b", fontSize: 13 }}>
                  #{o._id.slice(-8).toUpperCase()}
                </span>
                <span className={`badge ${BADGE_MAP[o.status] || ""}`}>{o.status}</span>
              </div>
              <p style={{ fontSize: 14, marginBottom: 4 }}>
                <strong>{o.userId?.name || "Unknown"}</strong> — {o.fuelType} {o.quantity}
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
                {o.location?.length > 40 ? o.location.slice(0, 40) + "..." : o.location}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "#f0f0f8" }}>
                  ₹{(o.totalPrice || 0).toLocaleString("en-IN")}
                </span>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  className="action-select"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPage;
