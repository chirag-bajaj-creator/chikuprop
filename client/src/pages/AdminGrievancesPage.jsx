import { useState, useEffect, useCallback } from "react";
import { getGrievances, updateGrievanceStatus } from "../services/adminService";
import { useToast } from "../context/ToastContext";
import StatusBadge from "../components/admin/StatusBadge";
import ConfirmModal from "../components/admin/ConfirmModal";
import "./AdminGrievancesPage.css";

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ["all", "pending", "in-progress", "resolved"];

function AdminGrievancesPage() {
  const { showToast } = useToast();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Expanded row to show full message
  const [expandedId, setExpandedId] = useState(null);

  // Status change modal
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchGrievances = useCallback(async (pageNum, status) => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: pageNum, limit: ITEMS_PER_PAGE };
      if (status && status !== "all") params.status = status;

      const response = await getGrievances(params);
      setGrievances(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to load grievances";
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
        const params = { page, limit: ITEMS_PER_PAGE };
        if (statusFilter && statusFilter !== "all") params.status = statusFilter;

        const response = await getGrievances(params);
        if (!cancelled) {
          setGrievances(response.data || []);
          setTotalPages(response.pagination?.pages || 1);
          setTotalItems(response.pagination?.total || 0);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err.response?.data?.error || "Failed to load grievances";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [page, statusFilter]);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const openStatusModal = (grievance, targetStatus) => {
    setStatusTarget(grievance);
    setNewStatus(targetStatus);
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget || !newStatus) return;
    setUpdatingStatus(true);

    try {
      await updateGrievanceStatus(statusTarget._id, newStatus);
      setGrievances((prev) =>
        prev.map((g) =>
          g._id === statusTarget._id ? { ...g, status: newStatus } : g
        )
      );
      showToast(`Grievance marked as ${newStatus}`, "success");
      setStatusTarget(null);
      setNewStatus("");
    } catch (err) {
      const message = err.response?.data?.error || "Failed to update status";
      showToast(message, "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusActions = (grievance) => {
    const actions = [];
    const { status } = grievance;

    if (status !== "in-progress") actions.push({ label: "In Progress", value: "in-progress", color: "blue" });
    if (status !== "resolved") actions.push({ label: "Resolve", value: "resolved", color: "green" });
    if (status !== "pending") actions.push({ label: "Reopen", value: "pending", color: "yellow" });

    return actions;
  };

  const formatCategory = (cat) => {
    if (!cat) return "Other";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Grievances ({totalItems})</h1>
      </div>

      {/* Filter bar */}
      <div className="admin-grievances-toolbar">
        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={handleStatusFilterChange}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "all" ? "All Statuses" : opt.charAt(0).toUpperCase() + opt.slice(1).replace("-", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button className="admin-btn admin-btn--primary" onClick={() => fetchGrievances(page, statusFilter)}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="admin-grievances-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-grievance-card admin-grievance-card--skeleton">
              <div className="admin-skeleton-line admin-skeleton-short" />
              <div className="admin-skeleton-line" />
              <div className="admin-skeleton-line admin-skeleton-short" />
            </div>
          ))}
        </div>
      )}

      {/* Data */}
      {!loading && !error && (
        <>
          {grievances.length === 0 ? (
            <div className="admin-empty">
              <p>No grievances found.</p>
            </div>
          ) : (
            <div className="admin-grievances-list">
              {grievances.map((g) => (
                <div key={g._id} className="admin-grievance-card">
                  <div className="admin-grievance-card__header">
                    <div className="admin-grievance-card__left">
                      <h3
                        className="admin-grievance-card__subject"
                        onClick={() => toggleExpand(g._id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && toggleExpand(g._id)}
                      >
                        {g.subject}
                      </h3>
                      <div className="admin-grievance-card__meta">
                        <span className="admin-grievance-card__category">{formatCategory(g.category)}</span>
                        <span className="admin-grievance-card__separator">|</span>
                        <span>{g.userId?.name || "Unknown User"}</span>
                        <span className="admin-grievance-card__separator">|</span>
                        <span>{g.userId?.email || ""}</span>
                        <span className="admin-grievance-card__separator">|</span>
                        <span>{formatDate(g.createdAt)}</span>
                      </div>
                    </div>
                    <div className="admin-grievance-card__right">
                      <StatusBadge status={g.status} />
                    </div>
                  </div>

                  {expandedId === g._id && (
                    <div className="admin-grievance-card__body">
                      <p className="admin-grievance-card__message">{g.message}</p>
                      {g.adminNotes && (
                        <div className="admin-grievance-card__notes">
                          <strong>Admin Notes:</strong> {g.adminNotes}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="admin-grievance-card__actions">
                    <button
                      className="admin-grievance-card__expand-btn"
                      onClick={() => toggleExpand(g._id)}
                    >
                      {expandedId === g._id ? "Hide Details" : "View Details"}
                    </button>
                    {getStatusActions(g).map((action) => (
                      <button
                        key={action.value}
                        className={`admin-action-btn admin-action-btn--${action.color}`}
                        onClick={() => openStatusModal(g, action.value)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
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
        title={`Mark as ${newStatus.replace("-", " ")}?`}
        message={`Update grievance "${statusTarget?.subject}" to ${newStatus.replace("-", " ")}.`}
        confirmLabel={`Set ${newStatus.replace("-", " ")}`}
        confirmVariant={newStatus === "resolved" ? "success" : "danger"}
        onConfirm={handleStatusConfirm}
        onCancel={() => !updatingStatus && setStatusTarget(null)}
        loading={updatingStatus}
      />
    </div>
  );
}

export default AdminGrievancesPage;
