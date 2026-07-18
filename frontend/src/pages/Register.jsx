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
import { api } from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.register(form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Registration failed");
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
          <h1>Create account</h1>
          <p className="auth-subtitle">Register as an admin or a regular user</p>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">Account created. Redirecting to login...</div>}

          <label>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />

          <label>Email address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
          />

          <label>Role</label>
          <select value={form.role} onChange={(e) => updateField("role", e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : (<>Create account <ArrowRight size={15} strokeWidth={2.2} /></>)}
          </button>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
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
            Join your team's shared knowledge workspace.
          </h2>
          <p className="auth-visual-subtitle">
            Create an account to upload documents, track tasks, and search
            your team's knowledge base with AI-assisted answers.
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
