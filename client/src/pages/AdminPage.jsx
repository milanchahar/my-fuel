import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const statuses = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

const statusClass = {
  Pending: "status-pending",
  Accepted: "status-accepted",
  "Out for Delivery": "status-out",
  Delivered: "status-delivered",
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

  useEffect(() => {
    fetchOrders();
  }, []);

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
    const matchesSearch =
      !search ||
      o.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = filtered.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="page">
      <h1 className="page-title">Admin Panel</h1>
      <p className="page-subtitle">Manage all fuel orders</p>

      <div className="admin-stats">
        <div className="stat-card">
          <p className="label">Total Orders</p>
          <p className="value">{filtered.length}</p>
        </div>
        <div className="stat-card">
          <p className="label">Total Revenue</p>
          <p className="value">Rs.{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
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
              <th>Delivery Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-row">No orders found</td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                  <td>{order.userId?.name || "N/A"}</td>
                  <td>{order.fuelType}</td>
                  <td>{order.quantity}</td>
                  <td>{order.location}</td>
                  <td>Rs.{order.totalPrice}</td>
                  <td>{new Date(order.deliveryTime).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${statusClass[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="action-select"
                    >
                      {statuses.map((s) => (
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
        {filtered.length === 0 ? (
          <div className="empty-state">No orders found</div>
        ) : (
          filtered.map((order) => (
            <div key={order._id} className="order-card">
              <div className="info">
                <div className="field">
                  <span>Order ID</span>
                  #{order._id.slice(-6).toUpperCase()}
                </div>
                <div className="field">
                  <span>Customer</span>
                  {order.userId?.name || "N/A"}
                </div>
                <div className="field">
                  <span>Fuel</span>
                  {order.fuelType} - {order.quantity}{order.fuelType === "CNG" ? "kg" : "L"}
                </div>
                <div className="field">
                  <span>Location</span>
                  {order.location}
                </div>
                <div className="field">
                  <span>Total</span>
                  Rs.{order.totalPrice}
                </div>
                <div className="field">
                  <span>Delivery</span>
                  {new Date(order.deliveryTime).toLocaleString()}
                </div>
              </div>
              <div className="right-col">
                <span className={`status-badge ${statusClass[order.status]}`}>
                  {order.status}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="action-select"
                >
                  {statuses.map((s) => (
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
