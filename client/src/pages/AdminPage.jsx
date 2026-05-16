import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const statuses = ["Pending", "Accepted", "Out for Delivery", "Delivered"];
const badgeClass = {
  Pending: "badge-pending", Accepted: "badge-accepted",
  "Out for Delivery": "badge-delivery", Delivered: "badge-delivered",
};

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/all");
      setOrders(data);
    } catch (err) {
      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Status updated");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search ||
      o.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const revenue = filtered.reduce((s, o) => s + o.totalPrice, 0);
  const pending = filtered.filter((o) => o.status === "Pending").length;
  const outForDelivery = filtered.filter((o) => o.status === "Out for Delivery").length;

  return (
    <div className="page-wide animate-fadeUp">
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Admin Panel</h1>
      <p style={{ color: '#9ca3af', marginBottom: 24 }}>Manage all fuel orders</p>

      <div className="admin-stats">
        <div className="card stat-card">
          <div className="stat-icon">📦</div>
          <p className="stat-label">Total Orders</p>
          <p className="stat-value color-amber">{filtered.length}</p>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">⏳</div>
          <p className="stat-label">Pending</p>
          <p className="stat-value color-blue">{pending}</p>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">🚚</div>
          <p className="stat-label">Out for Delivery</p>
          <p className="stat-value color-purple">{outForDelivery}</p>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">💰</div>
          <p className="stat-label">Revenue</p>
          <p className="stat-value color-amber">Rs.{revenue.toFixed(0)}</p>
        </div>
      </div>

      <div className="admin-filters">
        <input type="text" placeholder="Search by name or location..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="input" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select" style={{ maxWidth: 200 }}>
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th><th>Customer</th><th>Fuel</th><th>Qty</th>
              <th>Location</th><th>Total</th><th>Time</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', color: '#4b5563', padding: 32 }}>No orders found</td></tr>
            ) : filtered.map((o) => (
              <tr key={o._id}>
                <td className="order-id">#{o._id.slice(-6).toUpperCase()}</td>
                <td>{o.userId?.name || "N/A"}</td>
                <td>{o.fuelType}</td>
                <td>{o.quantity}</td>
                <td>{o.location}</td>
                <td>Rs.{o.totalPrice}</td>
                <td>{new Date(o.deliveryTime).toLocaleString()}</td>
                <td><span className={`badge ${badgeClass[o.status]}`}>{o.status}</span></td>
                <td>
                  <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)} className="action-select">
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-orders">
        {filtered.map((o) => (
          <div key={o._id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'monospace', color: '#f59e0b', fontSize: 13 }}>#{o._id.slice(-6).toUpperCase()}</span>
              <span className={`badge ${badgeClass[o.status]}`}>{o.status}</span>
            </div>
            <p style={{ fontSize: 14, marginBottom: 4 }}><strong>{o.userId?.name}</strong> — {o.fuelType} {o.quantity}{o.fuelType === "CNG" ? "kg" : "L"}</p>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>{o.location}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: '#f59e0b' }}>Rs.{o.totalPrice}</span>
              <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)} className="action-select">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
