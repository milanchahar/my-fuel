import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { RiGasStationFill } from "react-icons/ri";

const badgeClass = {
  Pending: "badge-pending",
  Accepted: "badge-accepted",
  "Out for Delivery": "badge-delivery",
  Delivered: "badge-delivered",
};

const fuelBg = { Diesel: "fuel-diesel", Petrol: "fuel-petrol", CNG: "fuel-cng", HSD: "fuel-hsd" };

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
    <div className="page animate-fadeUp">
      <div className="history-header">
        <h1>Order History</h1>
        {orders.length > 0 && <span className="count-pill">{orders.length} orders</span>}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><RiGasStationFill /></div>
          <h2>No orders yet</h2>
          <p>Place your first fuel order to get started</p>
          <button className="btn-primary" onClick={() => navigate("/place-order")}>
            Place First Order
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="card order-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className={`fuel-icon-square ${fuelBg[order.fuelType]}`}>
                  {order.fuelType?.charAt(0)}
                </div>
                <div className="order-meta">
                  <div className="om-id">#{order._id.slice(-8).toUpperCase()}</div>
                  <div className="om-date">{new Date(order.placedAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="order-details">
                <span>{order.location}</span>
                <span>{order.quantity} {order.fuelType === "CNG" ? "kg" : "L"} {order.fuelType}</span>
                <span>{new Date(order.deliveryTime).toLocaleString()}</span>
              </div>
              <div className="order-right">
                <span className="order-price">₹{order.totalPrice}</span>
                <span className={`badge ${badgeClass[order.status]}`}>{order.status}</span>
                <button className="track-link" onClick={() => navigate(`/track/${order._id}`)}>
                  Track →
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
