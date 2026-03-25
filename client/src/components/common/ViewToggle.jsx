import { FiGrid, FiList } from "react-icons/fi";
import "./ViewToggle.css";

function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div className="view-toggle">
      <button
        className={viewMode === "grid" ? "active" : ""}
        onClick={() => setViewMode("grid")}
        aria-label="Grid view"
      >
        <FiGrid size={18} />
      </button>
      <button
        className={viewMode === "list" ? "active" : ""}
        onClick={() => setViewMode("list")}
        aria-label="List view"
      >
        <FiList size={18} />
      </button>
    </div>
  );
}

export default ViewToggle;
