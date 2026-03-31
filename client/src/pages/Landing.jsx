import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "../components/common/SearchBar";
import PropertyCard from "../components/common/PropertyCard";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import { getProperties } from "../services/api";
import ChatBot from "../components/common/ChatBot";
import "./Landing.css";

const cities = [
  { name: "Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400" },
  { name: "Mumbai", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400" },
  { name: "Bangalore", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400" },
  { name: "Hyderabad", image: "https://images.unsplash.com/photo-1572883454114-efb8c4fba74b?w=400" },
  { name: "Pune", image: "https://images.unsplash.com/photo-1580581096469-8afb1650796a?w=400" },
  { name: "Chennai", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400" },
];

function Landing() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect admins to their dashboard
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" state={{ accessGranted: true }} replace />;
  }

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProperties({ limit: 4, sort: "newest" });
      setFeatured(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchFeatured();
    return () => controller.abort();
  }, []);

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <img
          className="hero-bg"
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400"
          alt="Modern property"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Find Your Dream Property</h1>
          <p>Discover properties for sale and rent across India</p>
          <SearchBar />
        </div>
      </section>

      {/* Cities Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Explore by City</h2>
          <div className="cities-grid">
            {cities.map((city) => (
              <Link
                to={`/buy?city=${city.name}`}
                key={city.name}
                className="city-card"
              >
                <img src={city.image} alt={city.name} />
                <div className="city-card__overlay">
                  <h3>{city.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section featured-section">
        <div className="container">
          <h2 className="section-title">Featured Properties</h2>
          {loading && <Loader />}
          {error && <ErrorState message={error} onRetry={fetchFeatured} />}
          {!loading && !error && (
            <div className="featured-grid">
              {featured.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
          <div className="featured-cta">
            <Link to="/buy" className="btn-primary">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="vendor-cta">
        <div className="container vendor-cta-content">
          <h2>Own a property? List it for free</h2>
          <p>Reach thousands of buyers and tenants across India</p>
          <Link to="/add-property" className="btn-primary">
            List Your Property
          </Link>
        </div>
      </section>

      <ChatBot />
    </div>
  );
}

export default Landing;
