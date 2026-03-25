import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { adminSignup } from "../services/authService";
import "./AdminLoginPage.css";

function AdminLoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    secretKey: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.role === "admin") {
      navigate("/admin/dashboard", { replace: true, state: { accessGranted: true } });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setError("");
    setFormData({ name: "", email: "", password: "", phone: "", secretKey: "" });
  };

  const validateLogin = () => {
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Enter a valid email";
    if (!formData.password) return "Password is required";
    return null;
  };

  const validateSignup = () => {
    if (!formData.name.trim()) return "Name is required";
    if (formData.name.trim().length < 2) return "Name must be at least 2 characters";
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Enter a valid email";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (!formData.secretKey.trim()) return "Secret key is required";
    return null;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateLogin();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await login(formData.email, formData.password);
      if (data.role !== "admin") {
        setError("Access denied — admin only");
        setLoading(false);
        return;
      }
      showToast("Welcome to the Admin Panel", "success");
      navigate("/admin/dashboard", { replace: true, state: { accessGranted: true } });
    } catch (err) {
      const message = err.response?.data?.error || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateSignup();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await adminSignup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        secretKey: formData.secretKey,
      });

      // Store token and user so AuthContext picks it up
      localStorage.setItem("chikuprop_token", data.token);
      showToast("Admin account created! Logging you in...", "success");
      // Reload to let AuthContext pick up the new token
      window.location.href = "/admin/dashboard";
    } catch (err) {
      const message = err.response?.data?.error || "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2 className="admin-login-logo">ChikuProp</h2>
          <p className="admin-login-subtitle">Admin Panel</p>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === "login" ? "admin-tab--active" : ""}`}
            onClick={() => handleTabSwitch("login")}
          >
            Sign In
          </button>
          <button
            className={`admin-tab ${tab === "signup" ? "admin-tab--active" : ""}`}
            onClick={() => handleTabSwitch("signup")}
          >
            Create Account
          </button>
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        {tab === "login" ? (
          <form className="admin-login-form" onSubmit={handleLoginSubmit}>
            <div className="admin-form-group">
              <label htmlFor="admin-email">Email</label>
              <input
                type="email"
                id="admin-email"
                name="email"
                placeholder="admin@chikuprop.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-password">Password</label>
              <div className="admin-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="admin-password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="admin-login-submit" disabled={loading}>
              {loading ? <span className="admin-btn-spinner"></span> : "Sign In"}
            </button>
          </form>
        ) : (
          <form className="admin-login-form" onSubmit={handleSignupSubmit}>
            <div className="admin-form-group">
              <label htmlFor="admin-name">Full Name</label>
              <input
                type="text"
                id="admin-name"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-signup-email">Email</label>
              <input
                type="email"
                id="admin-signup-email"
                name="email"
                placeholder="admin@chikuprop.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-signup-password">Password</label>
              <div className="admin-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="admin-signup-password"
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-phone">Phone (optional)</label>
              <input
                type="tel"
                id="admin-phone"
                name="phone"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-secret">Secret Key</label>
              <input
                type="password"
                id="admin-secret"
                name="secretKey"
                placeholder="Enter admin secret key"
                value={formData.secretKey}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            <button type="submit" className="admin-login-submit" disabled={loading}>
              {loading ? <span className="admin-btn-spinner"></span> : "Create Admin Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminLoginPage;
