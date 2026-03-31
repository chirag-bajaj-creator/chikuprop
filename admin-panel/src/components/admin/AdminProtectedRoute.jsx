import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../common/Loader";

function AdminProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
