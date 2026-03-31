import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Landing from "./pages/Landing";
import BuyPage from "./pages/BuyPage";
import RentPage from "./pages/RentPage";
import PropertyDetail from "./pages/PropertyDetail";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AddPropertyPage from "./pages/AddPropertyPage";
import MyListingsPage from "./pages/MyListingsPage";
import EditPropertyPage from "./pages/EditPropertyPage";
import BuyerDashboardPage from "./pages/BuyerDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import WantedPage from "./pages/WantedPage";
import PostWantedPage from "./pages/PostWantedPage";
import NotificationsPage from "./pages/NotificationsPage";
import ServicesPage from "./pages/ServicesPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminPropertiesPage from "./pages/AdminPropertiesPage";
import AdminGrievancesPage from "./pages/AdminGrievancesPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdvertisePage from "./pages/AdvertisePage";
import GrievancesPage from "./pages/GrievancesPage";
import GrievanceWidget from "./components/common/GrievanceWidget";
import NotFoundPage from "./pages/NotFoundPage";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import HiddenRoute from "./components/auth/HiddenRoute";
import AuthModal from "./components/auth/AuthModal";
import "./App.css";

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin/") && location.pathname !== "/admin/login";

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className={isAdminRoute ? "" : "main-content"}>
        <Routes>
          {/* Public routes — directly accessible */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/rent" element={<RentPage />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/advertise" element={<AdvertisePage />} />
          <Route path="/grievances" element={<GrievancesPage />} />
          <Route path="/wanted" element={<WantedPage />} />
          <Route path="/services" element={<ServicesPage />} />

          {/* User-protected routes */}
          <Route element={<ProtectedRoute roles={["user"]} />}>
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/edit-property/:id" element={<EditPropertyPage />} />
            <Route path="/dashboard" element={<BuyerDashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/add-property" element={<AddPropertyPage />} />
            <Route path="/wanted/post" element={<PostWantedPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Admin — hidden behind secret knock, typing URL directly shows 404 */}
          <Route path="/admin/login" element={<HiddenRoute><AdminLoginPage /></HiddenRoute>} />
          <Route element={<AdminProtectedRoute />}>
            <Route element={<HiddenRoute><AdminLayout /></HiddenRoute>}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/properties" element={<AdminPropertiesPage />} />
              <Route path="/admin/grievances" element={<AdminGrievancesPage />} />
              <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            </Route>
          </Route>

          {/* 404 catch-all — must be last */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {location.pathname === "/" && <GrievanceWidget />}
      {!isAdminRoute && <Footer />}
      <AuthModal />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
