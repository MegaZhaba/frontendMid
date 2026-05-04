import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-hero">
          <div className="auth-hero-logo">PEX</div>
          <div className="auth-hero-tag">Personal Exchange Platform</div>
          <div className="auth-stats">
            <div className="auth-stat">
              <div className="auth-stat-val">Live</div>
              <div className="auth-stat-label">Market Data</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-val">$10K</div>
              <div className="auth-stat-label">Starting Balance</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-val">WS</div>
              <div className="auth-stat-label">Real-Time Feed</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flex:1, padding:"2rem", position:"relative", zIndex:1 }}>
        <div className="auth-card">
          <div className="auth-card-logo">PEX</div>
          <h2>Sign In</h2>
          <p className="auth-sub">// ACCESS TERMINAL</p>

          {error && <div className="error-msg">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@exchange.io" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "AUTHENTICATING..." : "ACCESS PLATFORM →"}
            </button>
          </form>

          <p className="auth-link">No account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}