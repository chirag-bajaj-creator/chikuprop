import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { getNotifications, markAsRead, markAllRead } from "../services/notificationService";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import { FiUsers, FiAlertCircle, FiHome, FiBell } from "react-icons/fi";
import "./NotificationsPage.css";

function NotificationsPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNotifications({ page: pageNum, limit: 20 });
      const data = response.data;
      setNotifications(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to load notifications";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await fetchNotifications(page);
    };
    load();
    return () => { cancelled = true; };
  }, [page, fetchNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case "lead_created": return <FiUsers size={18} />;
      case "grievance_updated": return <FiAlertCircle size={18} />;
      case "property_flagged": return <FiHome size={18} />;
      default: return <FiBell size={18} />;
    }
  };

  const getLink = (notification) => {
    if (notification.relatedModel === "Property" && notification.relatedId) {
      return `/property/${notification.relatedId}`;
    }
    if (notification.relatedModel === "Grievance") {
      return "/grievances";
    }
    return null;
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const handleClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
      } catch {
        // silently fail
      }
    }

    const link = getLink(notification);
    if (link) navigate(link);
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast("All notifications marked as read", "success");
    } catch (err) {
      showToast("Failed to mark all as read", "error");
    } finally {
      setMarkingAll(false);
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  if (loading && notifications.length === 0) return <Loader />;
  if (error && notifications.length === 0) return <ErrorState message={error} onRetry={() => fetchNotifications(page)} />;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="container notifications-header-content">
          <h1>Notifications</h1>
          {hasUnread && (
            <button
              className="btn-secondary notifications-mark-all"
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              {markingAll ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>
      </div>

      <div className="container notifications-content">
        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <FiBell size={48} />
            <h3>No notifications yet</h3>
            <p>You will be notified when someone interacts with your properties or grievances.</p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notification-item ${n.isRead ? "" : "notification-item--unread"}`}
                  onClick={() => handleClick(n)}
                >
                  <div className={`notification-icon notification-icon--${n.type}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="notification-body">
                    <p className="notification-title">{n.title}</p>
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">{timeAgo(n.createdAt)}</span>
                  </div>
                  {!n.isRead && <span className="notification-dot"></span>}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="notifications-pagination">
                <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <span className="notifications-page-info">Page {page} of {totalPages}</span>
                <button className="btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
