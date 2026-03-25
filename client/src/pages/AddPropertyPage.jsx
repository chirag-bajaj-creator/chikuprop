import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import PropertyForm from "../components/property/PropertyForm";
import "./AddPropertyPage.css";

function AddPropertyPage() {
  const { user } = useAuth();
  const [pendingData, setPendingData] = useState(null);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);

  // Check localStorage for pending property on mount
  useEffect(() => {
    let cancelled = false;

    try {
      const stored = localStorage.getItem("pendingProperty");
      if (stored && !cancelled) {
        const parsed = JSON.parse(stored);
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        if (parsed.savedAt && Date.now() - parsed.savedAt > SEVEN_DAYS) {
          localStorage.removeItem("pendingProperty");
        } else {
          // Pre-fill contact info from user profile if available
          if (user) {
            parsed.contactPhone = parsed.contactPhone || user.phone || "";
            parsed.contactEmail = parsed.contactEmail || user.email || "";
          }
          setPendingData(parsed);
          setShowRestoreBanner(true);
        }
      }
    } catch {
      localStorage.removeItem("pendingProperty");
    }

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDismissBanner = () => {
    setShowRestoreBanner(false);
  };

  // Memoize initialData to prevent new object reference on every render
  const initialData = useMemo(() => {
    if (!pendingData) return null;
    return {
      _pendingRestore: true,
      listingType: pendingData.listingType,
      propertyType: pendingData.propertyType,
      title: pendingData.title,
      description: pendingData.description,
      price: pendingData.price,
      location: {
        city: pendingData.city,
        area: pendingData.area,
        state: pendingData.state,
        pincode: pendingData.pincode,
      },
      bedrooms: pendingData.bedrooms,
      bathrooms: pendingData.bathrooms,
      furnishing: pendingData.furnishing,
      areaSqft: pendingData.areaSqft,
      amenities: pendingData.amenities,
      images: pendingData.images,
      video: pendingData.video,
      contactPhone: pendingData.contactPhone,
      contactEmail: pendingData.contactEmail,
    };
  }, [pendingData]);

  return (
    <div className="add-property-page">
      <div className="add-property-header">
        <div className="container">
          <h1>List Your Property</h1>
          <p>Reach thousands of buyers and tenants across India -- for free</p>
        </div>
      </div>

      <div className="add-property-content container">
        {showRestoreBanner && (
          <div className="add-property-restore-banner">
            <p>Your property details have been restored. Review and submit.</p>
            <button
              className="restore-banner-close"
              onClick={handleDismissBanner}
              aria-label="Dismiss"
            >
              {"\u2715"}
            </button>
          </div>
        )}

        <PropertyForm
          mode="add"
          initialData={initialData}
        />
      </div>
    </div>
  );
}

export default AddPropertyPage;
