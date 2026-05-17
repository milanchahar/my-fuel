import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("user@myfuels.com");
  const [password, setPassword] = useState("user123");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "user") {
      setEmail("user@myfuels.com");
      setPassword("user123");
    } else {
      setEmail("admin@myfuels.com");
      setPassword("admin123");
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });
      login(data);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-left">
        <div className="bg-text">MYFUELS</div>
        <form onSubmit={handleSubmit} className="auth-form animate-fadeUp">
          <div style={{
            display: "flex",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "28px",
            gap: "4px",
          }}>
            {["user", "admin"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "9px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "0.3px",
                  transition: "all 0.2s ease",
                  background: role === r
                    ? r === "admin"
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : "#1a1a2e"
                    : "transparent",
                  color: role === r
                    ? r === "admin" ? "#000" : "#f0f0f8"
                    : "#6b7280",
                  boxShadow: role === r && r === "admin"
                    ? "0 4px 14px rgba(245,158,11,0.3)"
                    : role === r
                    ? "0 1px 0 rgba(255,255,255,0.05) inset"
                    : "none",
                }}
              >
                {r === "user" ? "User Login" : "Admin Login"}
              </button>
            ))}
          </div>

          <h1>{role === "admin" ? "Admin Portal" : "Welcome back"}</h1>
          <p className="sub">
            {role === "admin"
              ? "Sign in to manage orders and operations"
              : "Sign in to your MyFuels account"}
          </p>

          <div style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{ color: "#f59e0b", fontSize: "13px", lineHeight: 1 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </span>
            <span style={{ color: "#9ca3af", fontSize: "12px" }}>
              Demo credentials auto-filled. Just click Sign In.
            </span>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required className="input" />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" required className="input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Signing in..." : role === "admin" ? "Access Admin Panel" : "Sign In"}
          </button>
          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
      <div className="auth-right">
        <div>
          <p className="tagline">Fuel delivered. Problems solved.</p>
          <p className="tagline-sub">Order fuel for your business in minutes.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
