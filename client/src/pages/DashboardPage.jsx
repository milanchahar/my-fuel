import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

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

  return (
    <div className="page">
      <h1 className="page-title">Welcome back, {user?.name}</h1>
      <p className="page-subtitle">Here's your fuel order overview</p>

      <div className="stats-row">
        <div className="stat-card">
          <p className="label">Total Orders</p>
          <p className="value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="label">Pending</p>
          <p className="value">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <p className="label">Delivered</p>
          <p className="value">{stats.delivered}</p>
        </div>
      </div>

      <div className="actions-row">
        <button className="btn" onClick={() => navigate("/place-order")}>
          Place New Order
        </button>
        <button className="btn btn-outline" onClick={() => navigate("/history")}>
          View History
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
