import { useState, useEffect, useCallback } from "react";
import { getAppointments, updateAppointmentStatus } from "../services/adminService";
import { useToast } from "../context/ToastContext";
import StatusBadge from "../components/admin/StatusBadge";
import ConfirmModal from "../components/admin/ConfirmModal";
import "./AdminAppointmentsPage.css";

const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ["all", "pending", "approved", "rejected"];

function AdminAppointmentsPage() {
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchAppointments = useCallback(async (pageNum, status) => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: pageNum, limit: ITEMS_PER_PAGE };
      if (status && status !== "all") params.status = status;

      const response = await getAppointments(params);
      setAppointments(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to load appointments";
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

        const response = await getAppointments(params);
        if (!cancelled) {
          setAppointments(response.data || []);
          setTotalPages(response.pagination?.pages || 1);
          setTotalItems(response.pagination?.total || 0);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err.response?.data?.error || "Failed to load appointments";
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

  const openStatusModal = (appointment, targetStatus) => {
    setStatusTarget(appointment);
    setNewStatus(targetStatus);
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget || !newStatus) return;
    setUpdatingStatus(true);

    try {
      await updateAppointmentStatus(statusTarget._id, newStatus);
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === statusTarget._id ? { ...a, status: newStatus } : a
        )
      );
      showToast(`Appointment ${newStatus}`, "success");
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

  const formatType = (type) => type.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const getStatusActions = (appointment) => {
    const actions = [];
    const { status } = appointment;
    if (status !== "approved") actions.push({ label: "Approve", value: "approved", color: "green" });
    if (status !== "rejected") actions.push({ label: "Reject", value: "rejected", color: "red" });
    if (status !== "pending") actions.push({ label: "Reset to Pending", value: "pending", color: "yellow" });
    return actions;
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Appointments ({totalItems})</h1>
      </div>

      <div className="admin-grievances-toolbar">
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

      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button className="admin-btn admin-btn--primary" onClick={() => fetchAppointments(page, statusFilter)}>
            Try Again
          </button>
        </div>
      )}

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

      {!loading && !error && (
        <>
          {appointments.length === 0 ? (
            <div className="admin-empty">
              <p>No appointments found.</p>
            </div>
          ) : (
            <div className="admin-grievances-list">
              {appointments.map((a) => (
                <div key={a._id} className="admin-grievance-card">
                  <div className="admin-grievance-card__header">
                    <div className="admin-grievance-card__left">
                      <h3
                        className="admin-grievance-card__subject"
                        onClick={() => toggleExpand(a._id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && toggleExpand(a._id)}
                      >
                        {formatType(a.appointmentType)} Appointment
                      </h3>
                      <div className="admin-grievance-card__meta">
                        <span className="admin-grievance-card__category">{formatType(a.appointmentType)}</span>
                        <span className="admin-grievance-card__separator">|</span>
                        <span>{a.userId?.name || "Unknown User"}</span>
                        <span className="admin-grievance-card__separator">|</span>
                        <span>{a.userId?.email || ""}</span>
                        <span className="admin-grievance-card__separator">|</span>
                        <span>{formatDate(a.createdAt)}</span>
                      </div>
                    </div>
                    <div className="admin-grievance-card__right">
                      <StatusBadge status={a.status} />
                    </div>
                  </div>

                  {expandedId === a._id && (
                    <div className="admin-grievance-card__body">
                      <p className="admin-grievance-card__message">{a.description}</p>
                      {a.adminNotes && (
                        <div className="admin-grievance-card__notes">
                          <strong>Admin Notes:</strong> {a.adminNotes}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="admin-grievance-card__actions">
                    <button
                      className="admin-grievance-card__expand-btn"
                      onClick={() => toggleExpand(a._id)}
                    >
                      {expandedId === a._id ? "Hide Details" : "View Details"}
                    </button>
                    {getStatusActions(a).map((action) => (
                      <button
                        key={action.value}
                        className={`admin-action-btn admin-action-btn--${action.color}`}
                        onClick={() => openStatusModal(a, action.value)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

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

      <ConfirmModal
        isOpen={!!statusTarget}
        title={`${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} appointment?`}
        message={`${newStatus === "approved" ? "Approve" : newStatus === "rejected" ? "Reject" : "Reset"} this ${formatType(statusTarget?.appointmentType || "")} appointment from ${statusTarget?.userId?.name || "user"}.`}
        confirmLabel={newStatus === "approved" ? "Approve" : newStatus === "rejected" ? "Reject" : "Reset"}
        confirmVariant={newStatus === "approved" ? "success" : "danger"}
        onConfirm={handleStatusConfirm}
        onCancel={() => !updatingStatus && setStatusTarget(null)}
        loading={updatingStatus}
      />
    </div>
  );
}

export default AdminAppointmentsPage;
