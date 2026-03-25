import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiGrid, FiUsers, FiHome, FiMessageCircle, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import "./AdminLayout.css";

function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on click outside (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const getInitial = () => {
    if (!user?.name) return "A";
    return user.name.charAt(0).toUpperCase();
  };

  const navItems = [
    { to: "/admin/dashboard", icon: <FiGrid size={20} />, label: "Dashboard" },
    { to: "/admin/users", icon: <FiUsers size={20} />, label: "Users" },
    { to: "/admin/properties", icon: <FiHome size={20} />, label: "Properties" },
    { to: "/admin/grievances", icon: <FiMessageCircle size={20} />, label: "Grievances" },
  ];

  return (
    <div className="admin-root">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="admin-sidebar-overlay" />}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}
      >
        <div className="admin-sidebar__logo">
          <span className="admin-sidebar__logo-text">ChikuProp</span>
          <span className="admin-sidebar__logo-badge">Admin</span>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              state={{ accessGranted: true }}
              className={({ isActive }) =>
                `admin-sidebar__item ${isActive ? "admin-sidebar__item--active" : ""}`
              }
              aria-current={location.pathname === item.to ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__divider" />
          <button className="admin-sidebar__logout" onClick={logout}>
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button
            className="admin-topbar__hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <div className="admin-topbar__spacer" />
          <div className="admin-topbar__user">
            <span className="admin-topbar__name">{user?.name || "Admin"}</span>
            <div className="admin-topbar__avatar">{getInitial()}</div>
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
