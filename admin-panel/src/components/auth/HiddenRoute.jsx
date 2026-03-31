import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotFoundPage from "../../pages/NotFoundPage";

function HiddenRoute({ children }) {
  const location = useLocation();
  const { user } = useAuth();

  // Allow access if:
  // 1. User arrived via internal navigation with the secret key, OR
  // 2. User is already logged in as admin (so dashboard/users pages work after login)
  const hasSecretAccess = location.state?.accessGranted === true;
  const isAdmin = user?.role === "admin";

  if (!hasSecretAccess && !isAdmin) {
    return <NotFoundPage />;
  }

  return children;
}

export default HiddenRoute;
