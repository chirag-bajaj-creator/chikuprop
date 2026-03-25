import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { getMyProperties, togglePropertyStatus, deleteProperty } from "../services/propertyService";
import ListingCard from "../components/property/ListingCard";
import DeleteModal from "../components/common/DeleteModal";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import "./MyListingsPage.css";

function MyListingsPage() {
  const { showToast } = useToast();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProperties();
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to load your listings";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyProperties();
        if (!cancelled) setListings(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          const message = err.response?.data?.error || "Failed to load your listings";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await togglePropertyStatus(id, newStatus);
      setListings((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
      );
      showToast(
        newStatus === "active" ? "Listing activated" : "Listing paused",
        "success"
      );
    } catch (err) {
      const message = err.response?.data?.error || "Failed to update status";
      showToast(message, "error");
    }
  };

  const handleDeleteClick = (property) => {
    setDeleteTarget(property);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteProperty(deleteTarget._id);
      setListings((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      showToast("Property deleted successfully", "success");
      setDeleteTarget(null);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to delete property";
      showToast(message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleting) {
      setDeleteTarget(null);
    }
  };

  // Stats calculations
  const totalListings = listings.length;
  const totalViews = listings.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalContacts = listings.reduce((sum, p) => sum + (p.contactUnlockCount || 0), 0);
  const activeCount = listings.filter((p) => p.status === "active").length;

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={fetchListings} />;

  return (
    <div className="my-listings-page">
      <div className="my-listings-header">
        <div className="container my-listings-header-content">
          <div>
            <h1>My Listings</h1>
            <p className="my-listings-subtitle">
              You have {activeCount} active listing{activeCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Link to="/add-property" className="btn-primary my-listings-add-btn">
            List New Property
          </Link>
        </div>
      </div>

      <div className="container my-listings-content">
        {/* Stats bar */}
        {totalListings > 0 && (
          <div className="my-listings-stats">
            <div className="ml-stat-card">
              <span className="ml-stat-number">{totalListings}</span>
              <span className="ml-stat-label">Total Listings</span>
            </div>
            <div className="ml-stat-card">
              <span className="ml-stat-number">{totalViews}</span>
              <span className="ml-stat-label">Total Views</span>
            </div>
            <div className="ml-stat-card">
              <span className="ml-stat-number">{totalContacts}</span>
              <span className="ml-stat-label">Contact Unlocks</span>
            </div>
          </div>
        )}

        {/* Listings grid or empty state */}
        {totalListings === 0 ? (
          <div className="my-listings-empty">
            <div className="my-listings-empty-icon">
              <div className="empty-house"></div>
            </div>
            <h3>You haven't listed any properties yet</h3>
            <p>It only takes a few minutes to list your first property.</p>
            <Link to="/add-property" className="btn-primary">
              List Your First Property
            </Link>
          </div>
        ) : (
          <div className="my-listings-grid">
            {listings.map((property) => (
              <ListingCard
                key={property._id}
                property={property}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={!!deleteTarget}
        propertyTitle={deleteTarget?.title}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleting}
      />
    </div>
  );
}

export default MyListingsPage;
