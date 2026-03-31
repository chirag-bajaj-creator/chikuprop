import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUnreadCount } from "../../services/notificationService";
import { FiBell, FiMenu, FiX } from "react-icons/fi";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const { user, loading, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const moreRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close all dropdowns and mobile menu on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMoreOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Poll unread notification count
  const fetchUnread = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (!user || user.role === "admin") return;

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [user, fetchUnread]);

  const getInitial = () => {
    if (!user?.name) return "?";
    return user.name.charAt(0).toUpperCase();
  };

  const getFirstName = () => {
    if (!user?.name) return "";
    return user.name.split(" ")[0];
  };

  const isAdmin = user?.role === "admin";
  const logoLink = isAdmin ? "/admin/dashboard" : "/";

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to={logoLink} className="navbar-logo" state={isAdmin ? { accessGranted: true } : undefined}>
          Chiku<span>Prop</span>
        </Link>

        {/* Hamburger toggle for mobile */}
        {!isAdmin && (
          <button
            className="navbar-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        )}

        {/* Desktop nav links */}
        {!isAdmin && (
          <ul className="navbar-links">
            <li>
              <Link to="/" className={isActive("/") ? "active" : ""}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/buy" className={isActive("/buy") ? "active" : ""}>
                Buy
              </Link>
            </li>
            <li>
              <Link to="/rent" className={isActive("/rent") ? "active" : ""}>
                Rent
              </Link>
            </li>
            <li>
              <Link to="/add-property" className={`navbar-list-property${isActive("/add-property") ? " active" : ""}`}>
                List Property
              </Link>
            </li>
            <li className="navbar-more" ref={moreRef}>
              <button
                className={`navbar-more-btn${isActive("/services") ? " active" : ""}`}
                onClick={() => setMoreOpen(!moreOpen)}
                aria-label="More menu"
              >
                <FiMenu size={20} />
              </button>
              {moreOpen && (
                <div className="navbar-more-dropdown">
                  <Link to="/services" className={`navbar-more-item${isActive("/services") ? " active" : ""}`}>
                    Services
                  </Link>
                </div>
              )}
            </li>
          </ul>
        )}

        {isAdmin && (
          <ul className="navbar-links">
            <li>
              <Link to="/admin/dashboard" className={isActive("/admin/dashboard") ? "active" : ""} state={{ accessGranted: true }}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className={isActive("/admin/users") ? "active" : ""} state={{ accessGranted: true }}>
                Users
              </Link>
            </li>
          </ul>
        )}

        {/* Mobile menu */}
        {!isAdmin && mobileOpen && (
          <div className="navbar-mobile-menu">
            <Link to="/" className={isActive("/") ? "active" : ""}>Home</Link>
            <Link to="/buy" className={isActive("/buy") ? "active" : ""}>Buy</Link>
            <Link to="/rent" className={isActive("/rent") ? "active" : ""}>Rent</Link>
            <Link to="/add-property" className={isActive("/add-property") ? "active" : ""}>List Property</Link>
            <Link to="/services" className={isActive("/services") ? "active" : ""}>Services</Link>
          </div>
        )}

        <div className="navbar-actions">
          {loading ? (
            /* Prevent flash — render nothing while auth is loading */
            <div className="navbar-placeholder"></div>
          ) : user ? (
            <>
            {!isAdmin && (
              <Link to="/notifications" className="navbar-bell" aria-label="Notifications">
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="navbar-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </Link>
            )}
            <div className="navbar-user" ref={dropdownRef}>
              <button
                className="navbar-user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-label="User menu"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="navbar-avatar navbar-avatar--img" />
                ) : (
                  <div className="navbar-avatar">{getInitial()}</div>
                )}
                <span className="navbar-username">{getFirstName()}</span>
              </button>

              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="dropdown-item"
                      state={{ accessGranted: true }}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link to="/dashboard" className="dropdown-item">
                      Dashboard
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link to="/profile" className="dropdown-item">
                      Profile
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item dropdown-logout" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
            </>
          ) : (
            <button
              className="btn-primary navbar-login-btn"
              onClick={() => openAuthModal("login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
