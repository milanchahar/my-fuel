import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", { name, email, password });
      login(data);
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-left">
        <div className="bg-text">MYFUELS</div>
        <form onSubmit={handleSubmit} className="auth-form animate-fadeUp">
          <h1>Create account</h1>
          <p className="sub">Get started with MyFuels today</p>
          <div className="field">
            <label className="label">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your name" required className="input" />
          </div>
          <div className="field">
            <label className="label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required className="input" />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password" required className="input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating account..." : "Sign Up"}
          </button>
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
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

export default SignupPage;
