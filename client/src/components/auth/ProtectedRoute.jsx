import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../common/Loader";
import NotFoundPage from "../../pages/NotFoundPage";

function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  // Not logged in → redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role → show NotFoundPage
  if (roles && !roles.includes(user.role)) {
    return <NotFoundPage />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

