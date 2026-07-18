import { NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, FileText, Search, ListChecks, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, isAdmin, email, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!isAuthenticated) return null;

  const initial = email ? email.charAt(0).toUpperCase() : "?";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <LayoutGrid size={16} strokeWidth={2.2} />
        </div>
        <div className="sidebar-brand-text">
          Retriva
          <span>Knowledge System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/documents" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          <FileText size={17} strokeWidth={2} />
          Documents
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          <Search size={17} strokeWidth={2} />
          Search
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          <ListChecks size={17} strokeWidth={2} />
          Tasks
        </NavLink>
        {isAdmin && (
          <NavLink to="/analytics" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <BarChart3 size={17} strokeWidth={2} />
            Analytics
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-email">{email}</div>
            <div className="sidebar-user-role">{isAdmin ? "Admin" : "User"}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={15} strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
}
