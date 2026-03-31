import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { getSearchSuggestions } from "../../services/searchService";
import "./SearchBar.css";

function SearchBar() {
  const [city, setCity] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [listingType, setListingType] = useState("sale");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState({ projects: [], localities: [], cities: [] });
  const [loading, setLoading] = useState(false);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

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
      } catch (error) {
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

  const hasSuggestions = suggestions.cities.length > 0 || suggestions.localities.length > 0;

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);

    if (!city.trim()) {
      showToast("Please enter a city to search", "error");
      return;
    }

    const path = listingType === "sale" ? "/buy" : "/rent";
    let params = `?city=${encodeURIComponent(selectedCity || city.trim())}`;
    if (selectedArea) {
      params += `&area=${encodeURIComponent(selectedArea)}`;
    }
    navigate(`${path}${params}`);
  };

  const handleInputChange = (e) => {
    setCity(e.target.value);
    setSelectedCity("");
    setSelectedArea("");
    setShowSuggestions(true);
    fetchSuggestions(e.target.value);
  };

  const handleCitySelect = (cityName) => {
    setCity(cityName);
    setSelectedCity(cityName);
    setSelectedArea("");
    setShowSuggestions(false);
  };

  const handleAreaSelect = (areaName, cityName) => {
    setCity(areaName);
    setSelectedCity(cityName);
    setSelectedArea(areaName);
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
          placeholder="Search by city..."
          value={city}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(city.trim().length >= 2)}
        />
        <button type="submit" className="search-btn">
          <FiSearch size={20} />
          Search
        </button>

        {showSuggestions && hasSuggestions && (
          <ul className="search-suggestions">
            {suggestions.cities.map((c) => (
              <li key={`city-${c.city}`} className="search-suggestion-item" onClick={() => handleCitySelect(c.city)}>
                <span className="suggestion-name">{c.city}</span>
              </li>
            ))}
            {suggestions.localities.map((l) => (
              <li key={`area-${l.area}-${l.city}`} className="search-suggestion-item" onClick={() => handleAreaSelect(l.area, l.city)}>
                <span className="suggestion-name">{l.area}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}

export default SearchBar;
