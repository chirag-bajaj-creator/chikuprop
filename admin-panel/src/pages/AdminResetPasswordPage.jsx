import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { resetPassword as resetPasswordAPI } from "../services/authService";
import "./AdminResetPasswordPage.css";

function AdminResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const { openAuthModal } = useAuth();
  const { showToast } = useToast();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="admin-reset-password-page">
        <div className="admin-reset-password-card">
          <h1>Invalid Link</h1>
          <p className="admin-reset-password-error">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            className="btn-primary"
            onClick={() => openAuthModal("admin-forgot")}
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  const validate = () => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (!confirmPassword) return "Confirm password is required";
    if (password !== confirmPassword) return "Passwords do not match";
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
      await resetPasswordAPI(token, password);
      setSuccess(true);
      showToast("Password reset successfully! Please log in.", "success");
    } catch (err) {
      const message = err.response?.data?.error || "Failed to reset password. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="admin-reset-password-page">
        <div className="admin-reset-password-card">
          <h1>Password Reset Successful</h1>
          <p className="admin-reset-password-success">
            Your password has been reset. Click below to log in with your new password.
          </p>
          <button
            className="btn-primary"
            onClick={() => openAuthModal("admin-login")}
          >
            Login to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-reset-password-page">
      <div className="admin-reset-password-card">
        <h1>Reset Admin Password</h1>
        <form className="admin-reset-password-form" onSubmit={handleSubmit}>
          {error && <div className="admin-reset-password-error">{error}</div>}

          <div className="admin-reset-password-field">
            <label htmlFor="password">New Password</label>
            <div className="admin-reset-password-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="admin-reset-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="admin-reset-password-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="admin-reset-password-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="admin-reset-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary admin-reset-password-submit"
            disabled={loading}
          >
            {loading ? <span className="btn-spinner"></span> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminResetPasswordPage;
