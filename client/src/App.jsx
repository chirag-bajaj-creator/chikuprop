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
import AdvertisePage from "./pages/AdvertisePage";
import GrievancesPage from "./pages/GrievancesPage";
import GrievanceWidget from "./components/common/GrievanceWidget";
import NotFoundPage from "./pages/NotFoundPage";
import AuthModal from "./components/auth/AuthModal";
import InactivityWarning from "./components/common/InactivityWarning";
import "./App.css";

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public routes — directly accessible */}
          <Route path="/" element={<Landing />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/rent" element={<RentPage />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/advertise" element={<AdvertisePage />} />
          <Route path="/grievances" element={<GrievancesPage />} />
          <Route path="/wanted" element={<WantedPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/add-property" element={<AddPropertyPage />} />

          {/* User-protected routes */}
          <Route element={<ProtectedRoute roles={["user"]} />}>
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/edit-property/:id" element={<EditPropertyPage />} />
            <Route path="/dashboard" element={<BuyerDashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wanted/post" element={<PostWantedPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* 404 catch-all — must be last */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {location.pathname === "/" && <GrievanceWidget />}
      <Footer />
      <AuthModal />
      <InactivityWarning />
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
