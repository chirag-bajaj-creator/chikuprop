import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { forgotPassword as forgotPasswordAPI } from "../../services/authService";
import "./AuthModal.css";

const PHONE_REGEX = /^[6-9]\d{8}$/;

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", level: 1, color: "var(--error)" };
  if (score === 2) return { label: "Fair", level: 2, color: "var(--warning)" };
  if (score === 3) return { label: "Good", level: 3, color: "var(--success)" };
  return { label: "Strong", level: 4, color: "var(--success)" };
}

function LoginForm({ onSwitchToRegister, onSwitchToForgot }) {
  const { login, closeAuthModal, intendedPath, setIntendedPath } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        localStorage.removeItem("chikuprop_token");
        setError("Admin accounts cannot log in here. Use the admin panel.");
        showToast("Admin accounts must use the admin login panel.", "error");
        return;
      }
      showToast("Login successful! Welcome back.", "success");
      closeAuthModal();
      if (intendedPath) {
        navigate(intendedPath);
        setIntendedPath(null);
      }
    } catch (err) {
      const message =
        err.response?.data?.error || "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-modal-form" onSubmit={handleSubmit}>
      {error && <div className="auth-modal-error">{error}</div>}

      <div className="auth-modal-field">
        <label htmlFor="modal-email">Email</label>
        <input
          type="email"
          id="modal-email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
        />
      </div>

      <div className="auth-modal-field">
        <label htmlFor="modal-password">Password</label>
        <div className="auth-modal-password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            id="modal-password"
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
            className="auth-modal-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary auth-modal-submit"
        disabled={loading}
      >
        {loading ? <span className="btn-spinner"></span> : "Sign In"}
      </button>

      <p className="auth-modal-switch">
        <button type="button" className="auth-modal-switch-btn" onClick={onSwitchToForgot}>
          Forgot Password?
        </button>
      </p>

      <p className="auth-modal-switch">
        New to ChikuProp?{" "}
        <button type="button" className="auth-modal-switch-btn" onClick={onSwitchToRegister}>
          Register
        </button>
      </p>
    </form>
  );
}

function ForgotPasswordForm({ onSwitchToLogin }) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email";
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
      await forgotPasswordAPI(email);
      setSent(true);
      showToast("Check your email for password reset instructions.", "success");
    } catch (err) {
      const message =
        err.response?.data?.error || "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-modal-form">
        <p className="auth-modal-sent-msg">
          A password reset link has been sent to your email. Click the link to reset your password.
        </p>
        <button
          type="button"
          className="btn-primary auth-modal-submit"
          onClick={onSwitchToLogin}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <form className="auth-modal-form" onSubmit={handleSubmit}>
      {error && <div className="auth-modal-error">{error}</div>}

      <p className="auth-modal-forgot-hint">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <div className="auth-modal-field">
        <label htmlFor="modal-forgot-email">Email</label>
        <input
          type="email"
          id="modal-forgot-email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          autoComplete="email"
        />
      </div>

      <button
        type="submit"
        className="btn-primary auth-modal-submit"
        disabled={loading}
      >
        {loading ? <span className="btn-spinner"></span> : "Send Reset Link"}
      </button>

      <p className="auth-modal-switch">
        <button type="button" className="auth-modal-switch-btn" onClick={onSwitchToLogin}>
          Back to Login
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onSwitchToLogin }) {
  const { register, closeAuthModal } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!PHONE_REGEX.test(formData.phone))
      newErrors.phone = "Enter a valid 9-digit phone number";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      showToast("Account created successfully! Please login.", "success");
      onSwitchToLogin();
    } catch (err) {
      const message =
        err.response?.data?.error || "Something went wrong. Please try again.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <form className="auth-modal-form" onSubmit={handleSubmit}>
      {serverError && <div className="auth-modal-error">{serverError}</div>}

      <div className="auth-modal-field">
        <label htmlFor="modal-name">Full Name</label>
        <input
          type="text"
          id="modal-name"
          name="name"
          placeholder="Your full name"
          value={formData.name}
          onChange={handleChange}
          autoComplete="name"
        />
        {errors.name && <span className="auth-modal-field-error">{errors.name}</span>}
      </div>

      <div className="auth-modal-field">
        <label htmlFor="modal-reg-email">Email</label>
        <input
          type="email"
          id="modal-reg-email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
        />
        {errors.email && <span className="auth-modal-field-error">{errors.email}</span>}
      </div>

      <div className="auth-modal-field">
        <label htmlFor="modal-phone">Phone</label>
        <div className="auth-modal-phone-wrapper">
          <span className="auth-modal-phone-prefix">+91</span>
          <input
            type="tel"
            id="modal-phone"
            name="phone"
            placeholder="9876543210"
            value={formData.phone}
            onChange={handleChange}
            maxLength={9}
            autoComplete="tel"
          />
        </div>
        {errors.phone && <span className="auth-modal-field-error">{errors.phone}</span>}
      </div>

      <div className="auth-modal-field">
        <label htmlFor="modal-reg-password">Password</label>
        <div className="auth-modal-password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            id="modal-reg-password"
            name="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={handleChange}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="auth-modal-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {formData.password && (
          <div className="auth-modal-strength">
            <div className="auth-modal-strength-bar">
              <div
                className="auth-modal-strength-fill"
                style={{
                  width: `${(strength.level / 4) * 100}%`,
                  backgroundColor: strength.color,
                }}
              ></div>
            </div>
            <span className="auth-modal-strength-label" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
        )}
        {errors.password && <span className="auth-modal-field-error">{errors.password}</span>}
      </div>

      <div className="auth-modal-field">
        <label htmlFor="modal-confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="modal-confirmPassword"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <span className="auth-modal-field-error">{errors.confirmPassword}</span>
        )}
      </div>

      <button
        type="submit"
        className="btn-primary auth-modal-submit"
        disabled={loading}
      >
        {loading ? <span className="btn-spinner"></span> : "Create Account"}
      </button>

      <p className="auth-modal-switch">
        Already have an account?{" "}
        <button type="button" className="auth-modal-switch-btn" onClick={onSwitchToLogin}>
          Login
        </button>
      </p>
    </form>
  );
}

function AuthModal() {
  const { authModalView, closeAuthModal, openAuthModal } = useAuth();
  const modalRef = useRef(null);

  useEffect(() => {
    if (!authModalView) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeAuthModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [authModalView, closeAuthModal]);

  if (!authModalView) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeAuthModal();
    }
  };

  return (
    <div
      className="auth-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="auth-modal" ref={modalRef}>
        <button
          className="auth-modal-close"
          onClick={closeAuthModal}
          aria-label="Close"
        >
          &times;
        </button>

      {authModalView === "login" && <h1>Login</h1>}
      {authModalView === "register" && <h1>Register</h1>}
      {authModalView === "forgot" && <h1>Forgot Password</h1>}

        {authModalView === "login" && (
          <LoginForm
            onSwitchToRegister={() => openAuthModal("register")}
            onSwitchToForgot={() => openAuthModal("forgot")}
          />
        )}
        {authModalView === "register" && (
          <RegisterForm onSwitchToLogin={() => openAuthModal("login")} />
        )}
        {authModalView === "forgot" && (
          <ForgotPasswordForm onSwitchToLogin={() => openAuthModal("login")} />
        )}
      </div>
    </div>
  );
}

export default AuthModal;
