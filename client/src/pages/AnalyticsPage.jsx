import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { RiBarChartBoxLine } from "react-icons/ri";

const FUEL_COLORS = {
  Diesel: "#f59e0b",
  Petrol: "#ef4444",
  CNG: "#22c55e",
  HSD: "#3b82f6",
};

const shimmerStyle = {
  background: "linear-gradient(90deg, #13131f 25%, #1a1a2e 50%, #13131f 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  borderRadius: 8,
};

const cardBase = {
  background: "#0f0f1a",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: "20px 24px",
};

const tooltipStyle = {
  background: "#13131f",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  fontSize: 13,
  color: "#f0f0f8",
};

const AnalyticsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get("/orders/all");
        setOrders(data);
      } catch (err) {
        console.log("Failed to fetch orders for analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusData = [
    { name: "Pending", value: orders.filter((o) => o.status === "Pending").length, color: "#f59e0b" },
    { name: "Accepted", value: orders.filter((o) => o.status === "Accepted").length, color: "#60a5fa" },
    { name: "Out for Delivery", value: orders.filter((o) => o.status === "Out for Delivery").length, color: "#22c55e" },
    { name: "Delivered", value: orders.filter((o) => o.status === "Delivered").length, color: "#a78bfa" },
  ];

  const fuelTypes = ["Diesel", "Petrol", "CNG", "HSD"];
  const revenueByFuel = fuelTypes.map((fuel) => ({
    name: fuel,
    revenue: orders.filter((o) => o.fuelType === fuel).reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    orders: orders.filter((o) => o.fuelType === fuel).length,
  }));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayLabel = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
    return {
      day: dayLabel,
      orders: orders.filter((o) => o.placedAt?.split("T")[0] === dateStr || o.createdAt?.split("T")[0] === dateStr).length,
      revenue: orders
        .filter((o) => o.placedAt?.split("T")[0] === dateStr || o.createdAt?.split("T")[0] === dateStr)
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    };
  });

  const locationCount = {};
  orders.forEach((o) => {
    const loc = o.location?.split(",")[0]?.trim() || o.location;
    if (loc) locationCount[loc] = (locationCount[loc] || 0) + 1;
  });
  const topLocations = Object.entries(locationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const deliveryRate = orders.length
    ? Math.round((orders.filter((o) => o.status === "Delivered").length / orders.length) * 100)
    : 0;

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }} className="animate-fadeUp">
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...shimmerStyle, width: 120, height: 14, marginBottom: 12 }} />
          <div style={{ ...shimmerStyle, width: 260, height: 32, marginBottom: 8 }} />
          <div style={{ ...shimmerStyle, width: 320, height: 14 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ ...cardBase, ...shimmerStyle, height: 88 }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "55fr 45fr", gap: 20, marginBottom: 20 }}>
          <div style={{ ...cardBase, ...shimmerStyle, height: 300 }} />
          <div style={{ ...cardBase, ...shimmerStyle, height: 300 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "60fr 40fr", gap: 20 }}>
          <div style={{ ...cardBase, ...shimmerStyle, height: 300 }} />
          <div style={{ ...cardBase, ...shimmerStyle, height: 300 }} />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }} className="animate-fadeUp">
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minHeight: "60vh", gap: 16,
        }}>
          <RiBarChartBoxLine style={{ fontSize: 48, color: "#2a2a3e" }} />
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 20, fontWeight: 700, color: "#f0f0f8",
          }}>
            No data yet
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Analytics will appear once orders are placed
          </p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: "TOTAL REVENUE", value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      sub: "All time earnings", border: "#a78bfa", fontSize: 28,
    },
    {
      label: "TOTAL ORDERS", value: orders.length,
      sub: "Across all users", border: "#f59e0b", fontSize: 36,
    },
    {
      label: "AVG ORDER VALUE",
      value: `₹${avgOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      sub: "Per transaction", border: "#60a5fa", fontSize: 28,
    },
    {
      label: "DELIVERY RATE",
      value: `${deliveryRate}%`,
      sub: "Orders delivered",
      border: "#22c55e",
      fontSize: 36,
      valueColor: deliveryRate > 50 ? "#22c55e" : "#f59e0b",
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }} className="animate-fadeUp">

      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontSize: 11, letterSpacing: 3, color: "#f59e0b",
          fontWeight: 600, textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
        }}>
          <span style={{ width: 20, height: 2, background: "#f59e0b", display: "inline-block" }} />
          ANALYTICS
        </p>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 32, fontWeight: 800, color: "#f0f0f8",
        }}>
          Business Insights
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
          Data derived from all orders on the platform
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {summaryCards.map((card) => (
          <div key={card.label} style={{
            ...cardBase, borderLeft: `3px solid ${card.border}`,
          }}>
            <p style={{
              fontSize: 11, letterSpacing: 2, color: "#f59e0b",
              fontWeight: 600, textTransform: "uppercase", marginBottom: 8,
            }}>
              {card.label}
            </p>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: card.fontSize, fontWeight: 800,
              color: card.valueColor || "#f0f0f8", lineHeight: 1,
            }}>
              {card.value}
            </p>
            <p style={{ fontSize: 12, color: "#4b5563", marginTop: 8 }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "55fr 45fr", gap: 20, marginBottom: 20 }}>
        <div style={cardBase}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f8", marginBottom: 2 }}>
            Orders This Week
          </p>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
            Daily order count — last 7 days
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last7Days} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false} tickLine={false} allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: "#f59e0b" }}
                cursor={{ stroke: "rgba(245,158,11,0.15)" }}
              />
              <Line
                type="monotone" dataKey="orders"
                stroke="#f59e0b" strokeWidth={2.5}
                dot={{ r: 4, fill: "#f59e0b", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#f59e0b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={cardBase}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f8", marginBottom: 2 }}>
            Order Status Breakdown
          </p>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
            Current distribution across all orders
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData} cx="50%" cy="50%"
                innerRadius={65} outerRadius={90}
                paddingAngle={3} dataKey="value" strokeWidth={0}
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "8px 16px", marginTop: 12,
          }}>
            {statusData.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0,
                }} />
                <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
                  {s.name}
                </span>
                <span style={{ fontSize: 13, color: "#f0f0f8", fontWeight: 700, marginLeft: "auto" }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "60fr 40fr", gap: 20 }}>
        <div style={cardBase}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f8", marginBottom: 2 }}>
            Revenue by Fuel Type
          </p>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
            Total revenue generated per fuel category
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByFuel} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {revenueByFuel.map((entry, i) => (
                  <Cell key={i} fill={FUEL_COLORS[entry.name] || "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={cardBase}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f8", marginBottom: 2 }}>
            Top Delivery Locations
          </p>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
            Most frequent delivery addresses
          </p>
          {topLocations.length === 0 ? (
            <p style={{ color: "#4b5563", fontSize: 13, fontStyle: "italic" }}>
              No location data available
            </p>
          ) : (
            topLocations.map((loc, index) => (
              <div key={loc.name} style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: index < topLocations.length - 1
                  ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 18, fontWeight: 800,
                    color: index === 0 ? "#f59e0b" : "#2a2a3e",
                    minWidth: 28,
                  }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#d1d5db" }}>
                    {loc.name.length > 22 ? loc.name.slice(0, 22) + "…" : loc.name}
                  </span>
                </div>
                <span style={{
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  color: "#f59e0b", fontSize: 12, fontWeight: 600,
                  padding: "3px 10px", borderRadius: 50,
                }}>
                  {loc.count} orders
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
