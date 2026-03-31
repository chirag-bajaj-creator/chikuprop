import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "../components/common/PropertyCard";
import ViewToggle from "../components/common/ViewToggle";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import PropertyFilters from "../components/property/PropertyFilters";
import { getProperties } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { checkSavedBatch, saveProperty, unsaveProperty } from "../services/savedService";
import "./ListingPage.css";

function RentPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [pagination, setPagination] = useState({});
  const [savedIds, setSavedIds] = useState(new Set());
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    area: searchParams.get("area") || "",
    propertyType: "",
    bedrooms: "",
    minPrice: "",
    maxPrice: "",
    furnishing: "",
  });
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Sync filters when URL query params change
  useEffect(() => {
    const urlCity = searchParams.get("city") || "";
    const urlArea = searchParams.get("area") || "";
    const urlSearch = searchParams.get("search") || "";
    if (urlCity !== filters.city || urlArea !== filters.area) {
      setFilters((prev) => ({ ...prev, city: urlCity, area: urlArea }));
      setPage(1);
    }
    if (urlSearch !== search) {
      setSearch(urlSearch);
      setPage(1);
    }
  }, [searchParams]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { listingType: "rent", page, sort };
      if (search) params.search = search;
      if (filters.city) params.city = filters.city;
      if (filters.area) params.area = filters.area;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.furnishing) params.furnishing = filters.furnishing;

      const res = await getProperties(params);
      const items = res.data.data;
      setProperties(items);
      setPagination(res.data.pagination);

      if (user && items.length > 0) {
        try {
          const ids = items.map((p) => p._id);
          const savedMap = await checkSavedBatch(ids);
          setSavedIds(new Set(Object.keys(savedMap)));
        } catch {
          // Non-critical
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    return () => {};
  }, [filters, sort, page, search]);

  const handleToggleSave = async (propertyId) => {
    try {
      const isSaved = savedIds.has(propertyId);
      if (isSaved) {
        await unsaveProperty(propertyId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(propertyId);
          return next;
        });
        showToast("Property removed from saved", "success");
      } else {
        await saveProperty(propertyId);
        setSavedIds((prev) => new Set(prev).add(propertyId));
        showToast("Property saved", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update saved status", "error");
    }
  };

  return (
    <div className="listing-page">
      <div className="listing-header">
        <div className="container">
          <h1>Properties for Rent</h1>
          <p>Find your perfect rental property</p>
        </div>
      </div>

      <div className="container listing-content">
        <aside className="listing-sidebar">
          <PropertyFilters filters={filters} setFilters={setFilters} />
        </aside>

        <main className="listing-main">
          <div className="listing-toolbar">
            <p className="listing-count">
              {pagination.total || 0} properties found
            </p>
            <div className="listing-toolbar-right">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
          </div>

          {loading && <Loader />}
          {error && <ErrorState message={error} onRetry={fetchProperties} />}
          {!loading && !error && properties.length === 0 && (
            <div className="no-results">
              <h3>No rental properties found</h3>
              <p>Try adjusting your filters</p>
            </div>
          )}
          {!loading && !error && properties.length > 0 && (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "property-grid"
                    : "property-list"
                }
              >
                {properties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    viewMode={viewMode}
                    isSaved={savedIds.has(property._id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="btn-secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    className="btn-secondary"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default RentPage;
