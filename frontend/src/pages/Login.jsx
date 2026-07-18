import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  ArrowRight,
  MessageSquare,
  Headphones,
  Globe2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/tasks");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand-row">
        <div className="sidebar-brand-mark">
          <LayoutGrid size={15} strokeWidth={2.2} />
        </div>
        <span className="auth-brand-row-text">Retriva</span>
      </div>

      <div className="auth-page-form">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Please enter your details to continue</p>

          {error && <div className="error-box">{error}</div>}

          <label>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="auth-remember-row">
            <label htmlFor="remember">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember for 30 days
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : (<>Sign in <ArrowRight size={15} strokeWidth={2.2} /></>)}
          </button>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </form>
      </div>

      <div className="auth-page-visual">
        <div className="auth-visual-glow" />
        <div className="auth-visual-icons" aria-hidden="true">
          <MessageSquare className="auth-visual-icon" size={26} style={{ top: "12%", left: "18%" }} />
          <Headphones className="auth-visual-icon" size={30} style={{ top: "20%", right: "14%" }} />
          <Globe2 className="auth-visual-icon" size={22} style={{ top: "42%", left: "8%" }} />
          <Mail className="auth-visual-icon" size={24} style={{ bottom: "36%", right: "10%" }} />
          <Sparkles className="auth-visual-icon" size={20} style={{ top: "58%", right: "26%" }} />
          <ShieldCheck className="auth-visual-icon" size={22} style={{ bottom: "20%", left: "14%" }} />
        </div>
        <div className="auth-visual-content">
          <h2 className="auth-visual-title">
            Every document, task, and answer — in one place.
          </h2>
          <p className="auth-visual-subtitle">
            Retriva brings your team's documents, tasks, and search into a
            single workspace, so answers are always one question away.
          </p>
          <div className="auth-visual-card">
            <div className="auth-visual-card-icon">
              <ShieldCheck size={17} strokeWidth={2.2} />
            </div>
            <div>
              <div className="auth-visual-card-title">Enterprise-grade access control</div>
              <div className="auth-visual-card-sub">Role-based permissions, built in</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
