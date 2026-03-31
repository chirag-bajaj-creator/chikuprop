import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiShield, FiArrowRight } from "react-icons/fi";
import "./AdminWelcome.css";

function AdminWelcome() {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  // After successful login, redirect to dashboard
  useEffect(() => {
    const justLoggedIn = localStorage.getItem("adminJustLoggedIn");
    if (user?.role === "admin" && justLoggedIn === "true") {
      localStorage.removeItem("adminJustLoggedIn");
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleLoginClick = () => {
    openAuthModal("admin-login");
  };

  return (
    <div className="admin-welcome">
      {/* Background decorations */}
      <div className="admin-welcome__bg-blur admin-welcome__bg-blur--1" />
      <div className="admin-welcome__bg-blur admin-welcome__bg-blur--2" />

      <div className="admin-welcome__container">
        {/* Content */}
        <div className="admin-welcome__content">
          {/* Icon */}
          <div className="admin-welcome__icon">
            <FiShield size={60} />
          </div>

          {/* Heading */}
          <h1 className="admin-welcome__title">
            You are the <span className="admin-welcome__highlight">Savior</span> of This Website
          </h1>

          {/* Subtitle */}
          <p className="admin-welcome__subtitle">
            Welcome to the admin control center. Manage users, properties, grievances, and appointments with ease.
          </p>

          {/* Features */}
          <div className="admin-welcome__features">
            <div className="admin-welcome__feature">
              <div className="admin-welcome__feature-icon">👥</div>
              <div>
                <h3>User Management</h3>
                <p>Control and monitor all user accounts</p>
              </div>
            </div>

            <div className="admin-welcome__feature">
              <div className="admin-welcome__feature-icon">🏠</div>
              <div>
                <h3>Property Moderation</h3>
                <p>Approve and manage property listings</p>
              </div>
            </div>

            <div className="admin-welcome__feature">
              <div className="admin-welcome__feature-icon">💬</div>
              <div>
                <h3>Grievances</h3>
                <p>Handle user complaints and disputes</p>
              </div>
            </div>

            <div className="admin-welcome__feature">
              <div className="admin-welcome__feature-icon">📅</div>
              <div>
                <h3>Appointments</h3>
                <p>Track and manage scheduled appointments</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button className="admin-welcome__login-btn" onClick={handleLoginClick}>
            <span>Enter Admin Panel</span>
            <FiArrowRight size={18} />
          </button>

          {/* Footer text */}
          <p className="admin-welcome__footer">
            Only authorized admins can access this panel
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminWelcome;
