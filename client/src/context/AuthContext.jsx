import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser, getCurrentUser, adminSignup as adminSignupAPI } from "../services/authService";

const TOKEN_KEY = "chikuprop_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [authModalView, setAuthModalView] = useState(null); // null | "login" | "register" | "forgot" | "admin-login" | "admin-register"
  const [intendedPath, setIntendedPath] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(localStorage.getItem("admin_mode") === "true");
  const navigate = useNavigate();

  const openAuthModal = useCallback((view = "login", path = null) => {
    setAuthModalView(view);
    if (path) {
      setIntendedPath(path);
    }
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalView(null);
  }, []);

  // Listen for 401 auth:unauthorized CustomEvent
  useEffect(() => {
    const handleUnauthorized = (event) => {
      const path = event.detail?.path;
      const loginView = isAdminMode ? "admin-login" : "login";
      openAuthModal(loginView, path);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [openAuthModal, isAdminMode]);

  // On mount, verify token by fetching current user
  useEffect(() => {
    let cancelled = false;

    const verifyUser = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        if (!cancelled) {
          setUser(userData);
          setToken(storedToken);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    verifyUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password);
    const { token: newToken, ...userData } = data;
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(userData);
    return data;
  }, []);

  const register = useCallback(async ({ name, email, password, phone }) => {
    await registerUser({ name, email, password, phone });
  }, []);

  const adminSignup = useCallback(async ({ name, email, password, phone, secretKey }) => {
    await adminSignupAPI({ name, email, password, phone, secretKey });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      // silently fail — user is still logged in
    }
  }, []);

  const logout = useCallback(() => {
    const isAdmin = user?.role === "admin";
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    navigate(isAdmin ? "/admin/login" : "/");
  }, [navigate, user]);

  const value = { user, token, loading, login, register, adminSignup, logout, refreshUser, authModalView, openAuthModal, closeAuthModal, intendedPath, setIntendedPath, isAdminMode, setIsAdminMode };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
