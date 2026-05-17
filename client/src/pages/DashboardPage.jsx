import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { RiFileListLine, RiGasStationFill, RiTimeLine, RiCheckboxCircleLine, RiArrowRightLine } from "react-icons/ri";

const DashboardPage = () => {
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

export default DashboardPage;
