import { useState, useEffect, useCallback, useRef } from "react";
import { getAdminProperties, updatePropertyStatus, deleteAdminProperty } from "../services/adminService";
import { useToast } from "../context/ToastContext";
import StatusBadge from "../components/admin/StatusBadge";
import ConfirmModal from "../components/admin/ConfirmModal";
import { FiSearch, FiX } from "react-icons/fi";
import "./AdminPropertiesPage.css";

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ["all", "active", "paused", "flagged", "rejected", "expired"];

function AdminPropertiesPage() {
  const { showToast } = useToast();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Status change modal
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debounceRef = useRef(null);

  const fetchProperties = useCallback(async (pageNum, searchQuery, status) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pageNum,
        limit: ITEMS_PER_PAGE,
      };
      if (searchQuery) params.search = searchQuery;
      if (status && status !== "all") params.status = status;

      const response = await getAdminProperties(params);
      setProperties(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to load properties";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          page,
          limit: ITEMS_PER_PAGE,
        };
        if (search) params.search = search;
        if (statusFilter && statusFilter !== "all") params.status = statusFilter;

        const response = await getAdminProperties(params);
        if (!cancelled) {
          setProperties(response.data || []);
          setTotalPages(response.pagination?.pages || 1);
          setTotalItems(response.pagination?.total || 0);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err.response?.data?.error || "Failed to load properties";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [page, search, statusFilter]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 500);
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const openStatusModal = (property, targetStatus) => {
    setStatusTarget(property);
    setNewStatus(targetStatus);
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget || !newStatus) return;
    setUpdatingStatus(true);

    try {
      await updatePropertyStatus(statusTarget._id, newStatus);
      setProperties((prev) =>
        prev.map((p) =>
          p._id === statusTarget._id ? { ...p, status: newStatus } : p
        )
      );
      showToast(`Property status updated to ${newStatus}`, "success");
      setStatusTarget(null);
      setNewStatus("");
    } catch (err) {
      const message = err.response?.data?.error || "Failed to update status";
      showToast(message, "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await deleteAdminProperty(deleteTarget._id);
      setProperties((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setTotalItems((prev) => prev - 1);
      showToast("Property deleted permanently", "success");
      setDeleteTarget(null);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to delete property";
      showToast(message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(2)} L`;
    return `${price.toLocaleString("en-IN")}`;
  };

  const getStatusActions = (property) => {
    const actions = [];
    const { status } = property;

    if (status !== "active") actions.push({ label: "Activate", value: "active", color: "green" });
    if (status !== "paused") actions.push({ label: "Pause", value: "paused", color: "yellow" });
    if (status !== "flagged") actions.push({ label: "Flag", value: "flagged", color: "orange" });
    if (status !== "rejected") actions.push({ label: "Reject", value: "rejected", color: "red" });

    return actions;
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Properties ({totalItems})</h1>
      </div>

      {/* Search + Filter bar */}
      <div className="admin-properties-toolbar">
        <div className="admin-search-bar">
          <FiSearch size={18} className="admin-search-bar__icon" />
          <input
            type="text"
            placeholder="Search by title..."
            defaultValue={search}
            onChange={handleSearchChange}
            className="admin-search-bar__input"
          />
          {search && (
            <button className="admin-search-bar__clear" onClick={clearSearch}>
              <FiX size={16} />
            </button>
          )}
        </div>

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={handleStatusFilterChange}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "all" ? "All Statuses" : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button className="admin-btn admin-btn--primary" onClick={() => fetchProperties(page, search, statusFilter)}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="admin-table-wrapper">
          <table className="admin-table" aria-label="Properties table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Vendor</th>
                <th scope="col">Price</th>
                <th scope="col">Views</th>
                <th scope="col">Status</th>
                <th scope="col">Listed</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <td key={j}>
                      <div className="admin-skeleton-line admin-skeleton-short" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Data table */}
      {!loading && !error && (
        <>
          {properties.length === 0 ? (
            <div className="admin-empty">
              <p>No properties found.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table" aria-label="Properties table">
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Vendor</th>
                    <th scope="col">Price</th>
                    <th scope="col">Views</th>
                    <th scope="col">Status</th>
                    <th scope="col">Listed</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p._id}>
                      <td className="admin-table__name admin-table__title-cell">
                        {p.title}
                        {p.city && <span className="admin-table__city">{p.city}</span>}
                      </td>
                      <td>
                        <div className="admin-table__vendor">
                          <span>{p.vendorId?.name || "Unknown"}</span>
                          <span className="admin-table__vendor-email">{p.vendorId?.email || ""}</span>
                        </div>
                      </td>
                      <td>{formatPrice(p.price)}</td>
                      <td>{p.viewCount ?? 0}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>{formatDate(p.createdAt)}</td>
                      <td>
                        <div className="admin-actions-group">
                          {getStatusActions(p).map((action) => (
                            <button
                              key={action.value}
                              className={`admin-action-btn admin-action-btn--${action.color}`}
                              onClick={() => openStatusModal(p, action.value)}
                            >
                              {action.label}
                            </button>
                          ))}
                          <button
                            className="admin-action-btn admin-action-btn--red"
                            onClick={() => setDeleteTarget(p)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <span className="admin-pagination__info">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, totalItems)} of {totalItems}
              </span>
              <div className="admin-pagination__controls">
                <button
                  className="admin-pagination__btn"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Prev
                </button>
                <span className="admin-pagination__page">Page {page}</span>
                <button
                  className="admin-pagination__btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Status change confirmation */}
      <ConfirmModal
        isOpen={!!statusTarget}
        title={`${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} this property?`}
        message={`Change "${statusTarget?.title}" status to ${newStatus}.`}
        confirmLabel={`Set ${newStatus}`}
        confirmVariant={newStatus === "active" ? "success" : "danger"}
        onConfirm={handleStatusConfirm}
        onCancel={() => !updatingStatus && setStatusTarget(null)}
        loading={updatingStatus}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete this property?"
        message={`Permanently delete "${deleteTarget?.title}". This cannot be undone.`}
        confirmLabel="Delete Property"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => !deleting && setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default AdminPropertiesPage;
