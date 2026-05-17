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
      <div className="auth-left" style={{ overflow: "hidden" }}>
        <div className="bg-text" style={{
          fontSize: "180px", opacity: 0.03,
          position: "absolute", bottom: 0, left: "-20px", top: "auto",
          transform: "none",
        }}>MYFUELS</div>
        <form onSubmit={handleSubmit} className="auth-form animate-fadeUp">
          <div style={{ marginBottom: "28px" }}>
            <p style={{
              fontSize: 12, fontWeight: 600, color: "#6b7280",
              textTransform: "uppercase", letterSpacing: 1.5,
              marginBottom: 10, textAlign: "center",
            }}>
              Login as
            </p>
            <div style={{
              display: "flex",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "5px",
              gap: "5px",
            }}>
              {["user", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: "14px 10px",
                    borderRadius: "10px",
                    border: role === r
                      ? r === "admin"
                        ? "1.5px solid #f59e0b"
                        : "1.5px solid rgba(255,255,255,0.2)"
                      : "1.5px solid transparent",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "0.3px",
                    transition: "all 0.25s ease",
                    background: role === r
                      ? r === "admin"
                        ? "linear-gradient(135deg, #f59e0b, #d97706)"
                        : "#1a1a2e"
                      : "transparent",
                    color: role === r
                      ? r === "admin" ? "#000" : "#f0f0f8"
                      : "#4b5563",
                    boxShadow: role === r && r === "admin"
                      ? "0 4px 20px rgba(245,158,11,0.35)"
                      : role === r
                      ? "0 2px 8px rgba(0,0,0,0.3)"
                      : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {r === "user" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  )}
                  {r === "user" ? "User" : "Admin"}
                </button>
              ))}
            </div>
            <div style={{
              textAlign: "center", marginTop: 10,
              fontSize: 12, fontWeight: 600,
              color: role === "admin" ? "#f59e0b" : "#60a5fa",
              transition: "color 0.2s ease",
            }}>
              {role === "admin"
                ? "Logging in as Administrator"
                : "Logging in as User"}
            </div>
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

      <div className="auth-amber-panel" style={{
        width: "42%",
        background: "linear-gradient(145deg, #f59e0b, #d97706)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 52px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", width: "400px", height: "400px",
          borderRadius: "50%", background: "rgba(0,0,0,0.06)",
          top: "-100px", right: "-100px",
        }} />
        <div style={{
          position: "absolute", width: "250px", height: "250px",
          borderRadius: "50%", background: "rgba(0,0,0,0.04)",
          bottom: "60px", left: "-60px",
        }} />

        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800, fontSize: "22px",
          color: "#000", position: "relative", zIndex: 1,
        }}>
          MyFuels
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "42px", fontWeight: 800,
            color: "#000", lineHeight: 1.15, marginBottom: "16px",
          }}>
            Fuel delivered.<br />Problems solved.
          </h2>
          <p style={{
            color: "rgba(0,0,0,0.6)", fontSize: "15px",
            marginBottom: "48px",
          }}>
            Order fuel for your business in minutes.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { number: "180+", label: "Cities covered across India" },
              { number: "2,000+", label: "Businesses trust MyFuels" },
              { number: "35,000+", label: "Orders delivered successfully" },
            ].map((stat) => (
              <div key={stat.number} style={{
                display: "flex", alignItems: "center", gap: "16px",
              }}>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "28px", fontWeight: 800,
                  color: "#000", minWidth: "80px",
                }}>
                  {stat.number}
                </div>
                <div style={{
                  width: "1px", height: "32px",
                  background: "rgba(0,0,0,0.2)",
                }} />
                <div style={{
                  fontSize: "13px", color: "rgba(0,0,0,0.65)",
                  fontWeight: 500,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position: "relative", zIndex: 1,
          fontSize: "12px", color: "rgba(0,0,0,0.5)",
        }}>
          Trusted by Blinkit, Swiggy, Zomato & 2000+ businesses
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
