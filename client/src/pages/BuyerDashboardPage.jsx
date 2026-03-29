import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getSavedProperties, saveProperty } from "../services/savedService";
import { getRecentlyViewed } from "../services/recentlyViewedService";
import { getBuyerLeads, getVendorLeads } from "../services/leadService";
import { getVendorStats, getMatchingBuyers } from "../services/dashboardService";
import DashboardSection from "../components/dashboard/DashboardSection";
import StatCard from "../components/dashboard/StatCard";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import { FiList, FiEye, FiUsers, FiUnlock, FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import { formatPrice } from "../utils/formatPrice";
import "./BuyerDashboardPage.css";

function BuyerDashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [saved, setSaved] = useState([]);
  const [recent, setRecent] = useState([]);
  const [contacted, setContacted] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [vendorStats, setVendorStats] = useState(null);
  const [vendorLeads, setVendorLeads] = useState([]);
  const [matchingBuyers, setMatchingBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [savedRes, recentRes, contactedRes, statsRes, leadsRes, matchingRes] = await Promise.allSettled([
        getSavedProperties({ limit: 4 }),
        getRecentlyViewed({ limit: 4 }),
        getBuyerLeads({ limit: 4 }),
        getVendorStats(),
        getVendorLeads({ limit: 5 }),
        getMatchingBuyers(),
      ]);

      const savedData =
        savedRes.status === "fulfilled"
          ? savedRes.value.data?.data || savedRes.value.data || []
          : [];
      const savedProperties = savedData.map((s) => s.propertyId || s).filter(Boolean);

      const recentData =
        recentRes.status === "fulfilled"
          ? recentRes.value.data?.data || recentRes.value.data || []
          : [];
      const recentProperties = recentData.map((r) => r.propertyId || r).filter(Boolean);

      const contactedData =
        contactedRes.status === "fulfilled"
          ? contactedRes.value.data?.data || contactedRes.value.data || []
          : [];
      const contactedProperties = contactedData.map((c) => c.propertyId || c).filter(Boolean);

      const stats =
        statsRes.status === "fulfilled" ? statsRes.value : null;

      const leadsData =
        leadsRes.status === "fulfilled"
          ? leadsRes.value.data?.data || leadsRes.value.data || []
          : [];

      const matchingData =
        matchingRes.status === "fulfilled"
          ? matchingRes.value || []
          : [];

      setSaved(savedProperties);
      setMatchingBuyers(Array.isArray(matchingData) ? matchingData : []);
      setRecent(recentProperties);
      setContacted(contactedProperties);
      setVendorStats(stats);
      setVendorLeads(Array.isArray(leadsData) ? leadsData : []);

      const ids = new Set(savedProperties.map((p) => p._id));
      setSavedIds(ids);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to load dashboard";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await fetchAll();
    };

    load();
    return () => { cancelled = true; };
  }, [fetchAll]);

  const handleToggleSave = async (propertyId) => {
    try {
      const response = await saveProperty(propertyId);
      const action = response.data?.action || (savedIds.has(propertyId) ? "unsaved" : "saved");

      setSavedIds((prev) => {
        const next = new Set(prev);
        if (action === "unsaved") {
          next.delete(propertyId);
          setSaved((s) => s.filter((p) => p._id !== propertyId));
          showToast("Property removed from saved", "success");
        } else {
          next.add(propertyId);
          showToast("Property saved", "success");
        }
        return next;
      });
    } catch (err) {
      const message = err.response?.data?.error || "Failed to update saved status";
      showToast(message, "error");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const hasListings = vendorStats && vendorStats.totalListings > 0;

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={fetchAll} />;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="container dashboard-header-content">
          <h1>My Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {firstName}</p>
        </div>
      </div>

      <div className="container dashboard-content">
        {/* Vendor section — only shown if user has listed properties */}
        {hasListings && (
          <section className="dashboard-vendor-section">
            <h2>Your Listings</h2>

            <div className="dashboard-stats">
              <StatCard
                icon={<FiList size={20} />}
                number={vendorStats.totalListings}
                label="Total Listings"
              />
              <StatCard
                icon={<FiEye size={20} />}
                number={vendorStats.totalViews ?? 0}
                label="Total Views"
              />
              <StatCard
                icon={<FiUsers size={20} />}
                number={vendorStats.totalLeads ?? 0}
                label="Total Leads"
              />
              <StatCard
                icon={<FiUnlock size={20} />}
                number={vendorStats.totalUnlocks ?? 0}
                label="Contact Unlocks"
              />
            </div>

            <div className="dashboard-actions">
              <Link to="/my-listings" className="btn-secondary">
                My Listings
              </Link>
              <Link to="/add-property" className="btn-primary">
                Add Property
              </Link>
            </div>

            {/* Recent leads */}
            {vendorLeads.length > 0 && (
              <div className="dashboard-leads">
                <h3>Recent Leads</h3>

                {/* Desktop table */}
                <div className="dashboard-leads-table-wrapper">
                  <table className="dashboard-leads-table">
                    <thead>
                      <tr>
                        <th scope="col">Buyer Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Property</th>
                        <th scope="col">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorLeads.map((lead) => (
                        <tr key={lead._id}>
                          <td className="dl-name">{lead.userId?.name || "N/A"}</td>
                          <td className="dl-email">{lead.userId?.email || "N/A"}</td>
                          <td>
                            <Link
                              to={`/property/${lead.propertyId?._id}`}
                              className="dl-property-link"
                            >
                              {lead.propertyId?.title || "Deleted property"}
                            </Link>
                          </td>
                          <td className="dl-date">{formatDate(lead.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="dashboard-leads-cards">
                  {vendorLeads.map((lead) => (
                    <div key={lead._id} className="dashboard-lead-card">
                      <div className="dashboard-lead-card__buyer">
                        <span className="dashboard-lead-card__name">
                          {lead.userId?.name || "N/A"}
                        </span>
                        <span className="dashboard-lead-card__email">
                          {lead.userId?.email || "N/A"}
                        </span>
                      </div>
                      <Link
                        to={`/property/${lead.propertyId?._id}`}
                        className="dashboard-lead-card__property"
                      >
                        {lead.propertyId?.title || "Deleted property"}
                      </Link>
                      <span className="dashboard-lead-card__date">
                        {formatDate(lead.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Buyers */}
            <div className="dashboard-matching">
              <h3>Matching Buyers</h3>
              <p className="dashboard-matching__subtitle">
                People looking for properties like yours
              </p>
              {matchingBuyers.length > 0 ? (
                <>
                  <div className="dashboard-matching__grid">
                    {matchingBuyers.map((wanted) => (
                      <div key={wanted._id} className="matching-card">
                        <div className="matching-card__top">
                          <span className={`matching-card__badge matching-card__badge--${wanted.listingType}`}>
                            {wanted.listingType === "sale" ? "Want to Buy" : "Want to Rent"}
                          </span>
                          <span className="matching-card__type">
                            {wanted.propertyType.charAt(0).toUpperCase() + wanted.propertyType.slice(1)}
                          </span>
                        </div>
                        <h4 className="matching-card__title">{wanted.title}</h4>
                        <p className="matching-card__desc">{wanted.description}</p>
                        <div className="matching-card__budget">
                          Budget: <strong>{formatPrice(wanted.budget.min)} – {formatPrice(wanted.budget.max)}</strong>
                          {wanted.listingType === "rent" && <span>/mo</span>}
                        </div>
                        <div className="matching-card__meta">
                          <span><FiMapPin size={13} /> {wanted.location.area ? `${wanted.location.area}, ` : ""}{wanted.location.city}</span>
                          {wanted.bedrooms != null && <span>{wanted.bedrooms} BHK</span>}
                        </div>
                        <div className="matching-card__contact">
                          <span><FiPhone size={13} /> {wanted.contactPhone}</span>
                          <span><FiMail size={13} /> {wanted.contactEmail}</span>
                        </div>
                        {wanted.matchedPropertyTitle && (
                          <Link
                            to={`/property/${wanted.matchedPropertyId}`}
                            className="matching-card__match"
                          >
                            Matches your: {wanted.matchedPropertyTitle}
                          </Link>
                        )}
                        <span className="matching-card__poster">
                          by {wanted.userId?.name || "Anonymous"} · {formatDate(wanted.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link to="/wanted" className="btn-secondary matching-view-all">
                    View All Dream Homes
                  </Link>
                </>
              ) : (
                <div className="dashboard-matching__empty">
                  <p>No matching buyers yet. When someone posts a requirement that fits your listings, they'll appear here.</p>
                  <Link to="/wanted" className="btn-secondary">
                    Browse Dream Homes
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Buyer sections — shown for all users */}
        <DashboardSection
          title="Saved Properties"
          properties={saved}
          emptyMessage="No saved properties yet. Browse properties to find your next home."
          emptyAction="Browse Properties"
          emptyActionLink="/buy"
          showViewAll={saved.length > 4}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
        />

        <DashboardSection
          title="Recently Viewed"
          properties={recent}
          emptyMessage="No recently viewed properties."
          showViewAll={recent.length > 4}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
        />

        <DashboardSection
          title="Contacted Properties"
          properties={contacted}
          emptyMessage="You haven't contacted any vendors yet."
          emptyAction="Browse Properties"
          emptyActionLink="/buy"
          showViewAll={contacted.length > 4}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
        />
      </div>
    </div>
  );
}

export default BuyerDashboardPage;
