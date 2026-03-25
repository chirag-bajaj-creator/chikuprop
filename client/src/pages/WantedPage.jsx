import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getWantedProperties } from "../services/wantedService";
import WantedCard from "../components/property/WantedCard";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import "./WantedPage.css";

function WantedPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    city: "",
    propertyType: "",
    listingType: "",
  });

  const fetchProperties = useCallback(async (pageNum, currentFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = { page: pageNum, limit: 12 };
      if (currentFilters.city) params.city = currentFilters.city;
      if (currentFilters.propertyType) params.propertyType = currentFilters.propertyType;
      if (currentFilters.listingType) params.listingType = currentFilters.listingType;

      const response = await getWantedProperties(params);
      const data = response.data;

      setProperties(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to load wanted properties";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await fetchProperties(page, filters);
    };

    load();
    return () => { cancelled = true; };
  }, [page, filters, fetchProperties]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ city: "", propertyType: "", listingType: "" });
    setPage(1);
  };

  if (loading && page === 1 && properties.length === 0) return <Loader />;
  if (error && properties.length === 0) return <ErrorState message={error} onRetry={() => fetchProperties(page, filters)} />;

  return (
    <div className="wanted-page">
      <div className="wanted-page-header">
        <div className="container wanted-page-header-content">
          <h1>Wanted Properties</h1>
          <p className="wanted-page-subtitle">
            Find what buyers and renters are looking for — {total} active requirements
          </p>
        </div>
      </div>

      <div className="container wanted-page-content">
        {/* Filters */}
        <div className="wanted-filters">
          <input
            type="text"
            name="city"
            placeholder="Filter by city..."
            value={filters.city}
            onChange={handleFilterChange}
            className="wanted-filter-input"
          />
          <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange} className="wanted-filter-select">
            <option value="">All Types</option>
            <option value="flat">Flat</option>
            <option value="house">House</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>
          <select name="listingType" value={filters.listingType} onChange={handleFilterChange} className="wanted-filter-select">
            <option value="">Buy & Rent</option>
            <option value="sale">Want to Buy</option>
            <option value="rent">Want to Rent</option>
          </select>
          {(filters.city || filters.propertyType || filters.listingType) && (
            <button className="wanted-filter-clear" onClick={handleClearFilters}>
              Clear
            </button>
          )}
          <Link to="/wanted/post" className="btn-primary wanted-post-btn">
            Post Your Requirement
          </Link>
        </div>

        {/* Grid */}
        {properties.length === 0 ? (
          <div className="wanted-empty">
            <h3>No wanted properties found</h3>
            <p>Be the first to post your requirement.</p>
            <Link to="/wanted/post" className="btn-primary">
              Post Your Requirement
            </Link>
          </div>
        ) : (
          <>
            <div className="wanted-grid">
              {properties.map((w) => (
                <WantedCard key={w._id} wanted={w} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="wanted-pagination">
                <button
                  className="btn-secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="wanted-page-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn-secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WantedPage;
