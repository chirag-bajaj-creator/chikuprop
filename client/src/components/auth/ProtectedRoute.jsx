import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import Loader from "../common/Loader";

function ProtectedRoute({ roles }) {
  const { user, loading, openAuthModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user && !loading) {
      openAuthModal("login", location.pathname);
    }
  }, [user, loading, openAuthModal, location.pathname]);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    // Return null so user stays on same URL while modal opens
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    // Admin users go back to their dashboard, not the public home page
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace state={{ accessGranted: true }} />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
