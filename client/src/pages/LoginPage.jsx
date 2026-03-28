import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./LoginPage.css";

function LoginPage() {
  const { login, user, loading: authLoading, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Support ?redirect= query param, fall back to location.state, then role-based dashboard
  // Validate redirect is a safe relative path to prevent open redirect attacks
  const rawRedirect = searchParams.get("redirect") || location.state?.from?.pathname || "";
  const explicitRedirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "";

  const getDestination = (role) => {
    if (explicitRedirect) return explicitRedirect;
    return "/dashboard";
  };

  // Redirect if already authenticated (but not admin — they shouldn't use this page)
  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      navigate(getDestination(user.role), { replace: true });
    }
  }, [user, authLoading, navigate, explicitRedirect]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Enter a valid email";
    if (!formData.password) return "Password is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await login(formData.email, formData.password);
      if (data.role === "admin") {
        // Admin logged in via normal page — immediately clear session
        localStorage.removeItem("chikuprop_token");
        setError("Admin accounts cannot log in here. Use the admin panel.");
        showToast("Admin accounts must use the admin login panel.", "error");
        return;
      }
      showToast("Login successful! Welcome back.", "success");
      // Navigation handled by useEffect when user state updates
    } catch (err) {
      const message =
        err.response?.data?.error || "Something went wrong. Please try again.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your ChikuProp account</p>
        </div>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <p className="forgot-password">Forgot password? <button type="button" className="forgot-password-btn" onClick={() => openAuthModal("forgot")}>Reset it</button></p>

          <button
            type="submit"
            className="btn-primary login-submit"
            disabled={loading}
          >
            {loading ? <span className="btn-spinner"></span> : "Sign In"}
          </button>
        </form>

        <p className="login-footer">
          New to ChikuProp?{" "}
          <Link
            to={searchParams.get("redirect") ? `/register?redirect=${encodeURIComponent(searchParams.get("redirect"))}` : "/register"}
            className="login-link"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
