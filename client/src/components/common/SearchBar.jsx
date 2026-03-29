import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { getSearchSuggestions } from "../../services/searchService";
import "./SearchBar.css";

function SearchBar() {
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("sale");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState({ projects: [], localities: [], cities: [] });
  const [loading, setLoading] = useState(false);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Debounced fetch suggestions from DB
  const fetchSuggestions = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions({ projects: [], localities: [], cities: [] });
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await getSearchSuggestions(query.trim());
        setSuggestions(data);
      } catch {
        setSuggestions({ projects: [], localities: [], cities: [] });
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasSuggestions = suggestions.projects.length > 0 || suggestions.localities.length > 0 || suggestions.cities.length > 0;

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const path = listingType === "sale" ? "/buy" : "/rent";
    const params = city.trim() ? `?search=${encodeURIComponent(city.trim())}` : "";
    navigate(`${path}${params}`);
  };

  const handleInputChange = (e) => {
    setCity(e.target.value);
    setShowSuggestions(true);
    fetchSuggestions(e.target.value);
  };

  const handleSelect = (name) => {
    setCity(name);
    setShowSuggestions(false);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
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
        <button type="button" className={listingType === "sale" ? "active" : ""} onClick={() => setListingType("sale")}>
          Buy
        </button>
        <button type="button" className={listingType === "rent" ? "active" : ""} onClick={() => setListingType("rent")}>
          Rent
        </button>
      </div>
      <div className="search-input-group" ref={suggestionsRef}>
        <input
          type="text"
          placeholder="Search by project, locality, or city..."
          value={city}
          onChange={handleInputChange}
          onFocus={() => city.trim().length >= 2 && setShowSuggestions(true)}
        />
        <button type="submit" className="search-btn">
          <FiSearch size={20} />
          Search
        </button>

        {showSuggestions && hasSuggestions && (
          <ul className="search-suggestions">
            {suggestions.projects.length > 0 && (
              <>
                <li className="search-suggestions__group-header">Projects</li>
                {suggestions.projects.map((p) => (
                  <li key={`project-${p.name}`} className="search-suggestion-item" onClick={() => handleSelect(p.name)}>
                    <span className="suggestion-name">{p.name}</span>
                    <span className="suggestion-subtext">{p.city}</span>
                  </li>
                ))}
              </>
            )}
            {suggestions.localities.length > 0 && (
              <>
                <li className="search-suggestions__group-header">Localities</li>
                {suggestions.localities.map((l) => (
                  <li key={`locality-${l.area}-${l.city}`} className="search-suggestion-item" onClick={() => handleSelect(l.area)}>
                    <span className="suggestion-name">{l.area}</span>
                    <span className="suggestion-subtext">{l.city}</span>
                  </li>
                ))}
              </>
            )}
            {suggestions.cities.length > 0 && (
              <>
                <li className="search-suggestions__group-header">Cities</li>
                {suggestions.cities.map((c) => (
                  <li key={`city-${c.city}`} className="search-suggestion-item" onClick={() => handleSelect(c.city)}>
                    <span className="suggestion-name">{c.city}</span>
                  </li>
                ))}
              </>
            )}
          </ul>
        )}
      </div>
    </form>
  );
}

export default SearchBar;
