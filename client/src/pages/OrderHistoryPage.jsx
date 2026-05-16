import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const statusClass = {
  Pending: "status-pending",
  Accepted: "status-accepted",
  "Out for Delivery": "status-out",
  Delivered: "status-delivered",
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/my");
        setOrders(data);
      } catch (err) {
        console.log("Failed to fetch orders");
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Order History</h1>
      <p className="page-subtitle">All your fuel orders</p>

      {orders.length === 0 ? (
        <div className="empty-state">No orders yet. Place your first order!</div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="info">
                <div className="field">
                  <span>Fuel Type</span>
                  {order.fuelType}
                </div>
                <div className="field">
                  <span>Quantity</span>
                  {order.quantity} {order.fuelType === "CNG" ? "kg" : "L"}
                </div>
                <div className="field">
                  <span>Location</span>
                  {order.location}
                </div>
                <div className="field">
                  <span>Total Price</span>
                  Rs.{order.totalPrice}
                </div>
                <div className="field">
                  <span>Delivery Time</span>
                  {new Date(order.deliveryTime).toLocaleString()}
                </div>
              </div>
              <div className="right-col">
                <span className={`status-badge ${statusClass[order.status]}`}>
                  {order.status}
                </span>
                <button
                  className="track-btn"
                  onClick={() => navigate(`/track/${order._id}`)}
                >
                  Track Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
