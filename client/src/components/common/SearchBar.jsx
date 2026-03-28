import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import {
  fetchIndianLocations,
  filterLocations,
} from "../../services/cityService";
import "./SearchBar.css";

function SearchBar() {
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("sale");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  // Fetch all Indian locations once on mount
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetchIndianLocations()
      .then((locations) => {
        if (!cancelled) setAllLocations(locations);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = filterLocations(allLocations, city);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const path = listingType === "sale" ? "/buy" : "/rent";
    const params = city.trim()
      ? `?search=${encodeURIComponent(city.trim())}`
      : "";
    navigate(`${path}${params}`);
  };

  const handleInputChange = (e) => {
    setCity(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelect = (location) => {
    setCity(location.name);
    setShowSuggestions(false);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setShowSuggestions(false);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <div className="search-toggle">
        <button
          type="button"
          className={listingType === "sale" ? "active" : ""}
          onClick={() => setListingType("sale")}
        >
          Buy
        </button>
        <button
          type="button"
          className={listingType === "rent" ? "active" : ""}
          onClick={() => setListingType("rent")}
        >
          Rent
        </button>
      </div>
      <div className="search-input-group" ref={suggestionsRef}>
        <input
          type="text"
          placeholder={
            loading
              ? "Loading locations..."
              : "Enter city, state, or district..."
          }
          value={city}
          onChange={handleInputChange}
          onFocus={() => city.trim() && setShowSuggestions(true)}
          disabled={loading}
        />
        <button type="submit" className="search-btn" disabled={loading}>
          <FiSearch size={20} />
          Search
        </button>

        {showSuggestions && filtered.length > 0 && (
          <ul className="search-suggestions">
            {filtered.map((loc) => (
              <li
                key={`${loc.type}-${loc.name}-${loc.state}`}
                className="search-suggestion-item"
                onClick={() => handleSelect(loc)}
              >
                <span className="suggestion-name">{loc.name}</span>
                <span className="suggestion-meta">
                  <span
                    className={`suggestion-type-badge badge-${loc.type.toLowerCase()}`}
                  >
                    {loc.type}
                  </span>  
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}

export default SearchBar;
