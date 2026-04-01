import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import AdminWelcome from "./pages/AdminWelcome";
import AdminResetPasswordPage from "./pages/AdminResetPasswordPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminPropertiesPage from "./pages/AdminPropertiesPage";
import AdminGrievancesPage from "./pages/AdminGrievancesPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import AdminLayout from "./components/admin/AdminLayout";
import Loader from "./components/common/Loader";
import AuthModal from "./components/auth/AuthModal";
import InactivityWarning from "./components/common/InactivityWarning";
import "./App.css";

function ProtectedDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  // Not logged in → show welcome page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Wrong role
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Logged in as admin → show dashboard with layout
  return <AdminLayout />;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Welcome/Login page - before authentication */}
      <Route path="/" element={<AdminWelcome />} />

      {/* Password reset page - accessible without auth */}
      <Route path="/reset-password" element={<AdminResetPasswordPage />} />

      {/* Protected dashboard routes - after authentication */}
      <Route element={<ProtectedDashboard />}>
        <Route path="/dashboard" element={<AdminDashboardPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/properties" element={<AdminPropertiesPage />} />
        <Route path="/grievances" element={<AdminGrievancesPage />} />
        <Route path="/appointments" element={<AdminAppointmentsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
          <AuthModal />
          <InactivityWarning />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
