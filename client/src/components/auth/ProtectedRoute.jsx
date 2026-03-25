import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../common/Loader";

function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    // Use ?redirect= query param so LoginPage can read it — only safe relative paths
    const safePath = location.pathname.startsWith("/") && !location.pathname.startsWith("//")
      ? location.pathname : "/";
    const redirectPath = `/login?redirect=${encodeURIComponent(safePath)}`;
    return <Navigate to={redirectPath} replace />;
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
