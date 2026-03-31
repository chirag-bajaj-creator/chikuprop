import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../common/Loader";
import NotFoundPage from "../../pages/NotFoundPage";

function ProtectedRoute({ roles }) {
  const { user, loading, openAuthModal } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  // Not logged in → open login modal
  if (!user) {
    openAuthModal("login", location.pathname);
    return <Loader />;
  }

  // Wrong role → show NotFoundPage
  if (roles && !roles.includes(user.role)) {
    return <NotFoundPage />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

