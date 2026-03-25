import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import "./SearchBar.css";

function SearchBar() {
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("sale");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const path = listingType === "sale" ? "/buy" : "/rent";
    const params = city.trim() ? `?search=${encodeURIComponent(city.trim())}` : "";
    navigate(`${path}${params}`);
  };

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
      <div className="search-input-group">
        <input
          type="text"
          placeholder="Enter city, area, or project..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" className="search-btn">
          <FiSearch size={20} />
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
