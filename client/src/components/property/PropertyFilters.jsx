import "./PropertyFilters.css";

function PropertyFilters({ filters, setFilters }) {
  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="property-filters">
      <h3>Filters</h3>

      <div className="filter-group">
        <label>Property Type</label>
        <select
          value={filters.propertyType || ""}
          onChange={(e) => handleChange("propertyType", e.target.value)}
        >
          <option value="">All Types</option>
          <option value="flat">Flat</option>
          <option value="house">House</option>
          <option value="plot">Plot</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Bedrooms</label>
        <select
          value={filters.bedrooms || ""}
          onChange={(e) => handleChange("bedrooms", e.target.value)}
        >
          <option value="">Any</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4+ BHK</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Min Price</label>
        <input
          type="number"
          placeholder="Min"
          value={filters.minPrice || ""}
          onChange={(e) => handleChange("minPrice", e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Max Price</label>
        <input
          type="number"
          placeholder="Max"
          value={filters.maxPrice || ""}
          onChange={(e) => handleChange("maxPrice", e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Furnishing</label>
        <select
          value={filters.furnishing || ""}
          onChange={(e) => handleChange("furnishing", e.target.value)}
        >
          <option value="">Any</option>
          <option value="furnished">Furnished</option>
          <option value="semi-furnished">Semi-Furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>
      </div>

      <button
        className="btn-secondary filter-clear"
        onClick={() =>
          setFilters((prev) => ({
            city: prev.city,
            propertyType: "",
            bedrooms: "",
            minPrice: "",
            maxPrice: "",
            furnishing: "",
          }))
        }
      >
        Clear Filters
      </button>
    </div>
  );
}

export default PropertyFilters;
