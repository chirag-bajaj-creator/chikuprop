import { useState, useEffect, useCallback, useRef } from "react";
import { getUsers, blockUser } from "../services/adminService";
import { useToast } from "../context/ToastContext";
import StatusBadge from "../components/admin/StatusBadge";
import ConfirmModal from "../components/admin/ConfirmModal";
import { FiSearch, FiX } from "react-icons/fi";
import "./AdminUsersPage.css";

const USERS_PER_PAGE = 10;

function AdminUsersPage() {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Block/unblock modal
  const [blockTarget, setBlockTarget] = useState(null);
  const [blocking, setBlocking] = useState(false);

  const debounceRef = useRef(null);

  const fetchUsers = useCallback(async (pageNum, searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers({
        page: pageNum,
        limit: USERS_PER_PAGE,
        search: searchQuery || undefined,
      });
      const data = response.data;
      setUsers(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalUsers(data.total || 0);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to load users";
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
        const response = await getUsers({
          page,
          limit: USERS_PER_PAGE,
          search: search || undefined,
        });
        if (!cancelled) {
          const data = response.data;
          setUsers(data.data || []);
          setTotalPages(data.totalPages || 1);
          setTotalUsers(data.total || 0);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err.response?.data?.error || "Failed to load users";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [page, search]);

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

  const handleBlockClick = (user) => {
    setBlockTarget(user);
  };

  const handleBlockConfirm = async () => {
    if (!blockTarget) return;
    setBlocking(true);

    try {
      const newBlocked = !blockTarget.isBlocked;
      await blockUser(blockTarget._id, newBlocked);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === blockTarget._id ? { ...u, isBlocked: newBlocked } : u
        )
      );
      showToast(
        newBlocked ? `${blockTarget.name} has been blocked` : `${blockTarget.name} has been unblocked`,
        "success"
      );
      setBlockTarget(null);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to update user status";
      showToast(message, "error");
    } finally {
      setBlocking(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Users ({totalUsers})</h1>
      </div>

      {/* Search bar */}
      <div className="admin-search-bar">
        <FiSearch size={18} className="admin-search-bar__icon" />
        <input
          type="text"
          placeholder="Search by name or email..."
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

      {/* Error state */}
      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button className="admin-btn admin-btn--primary" onClick={() => fetchUsers(page, search)}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="admin-table-wrapper">
          <table className="admin-table" aria-label="Users table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Role</th>
                <th scope="col">Joined</th>
                <th scope="col">Status</th>
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
          {users.length === 0 ? (
            <div className="admin-empty">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table" aria-label="Users table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Role</th>
                    <th scope="col">Joined</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="admin-table__name">{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || "N/A"}</td>
                      <td><StatusBadge status={u.role} /></td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <StatusBadge status={u.isBlocked ? "blocked" : "active"} />
                      </td>
                      <td>
                        {u.role !== "admin" && (
                          <button
                            className={`admin-action-btn ${u.isBlocked ? "admin-action-btn--green" : "admin-action-btn--red"}`}
                            onClick={() => handleBlockClick(u)}
                            aria-label={u.isBlocked ? `Unblock ${u.name}` : `Block ${u.name}`}
                          >
                            {u.isBlocked ? "Unblock" : "Block"}
                          </button>
                        )}
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
                Showing {(page - 1) * USERS_PER_PAGE + 1}-{Math.min(page * USERS_PER_PAGE, totalUsers)} of {totalUsers}
              </span>
              <div className="admin-pagination__controls">
                <button
                  className="admin-pagination__btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </button>
                <span className="admin-pagination__page">Page {page}</span>
                <button
                  className="admin-pagination__btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!blockTarget}
        title={blockTarget?.isBlocked ? `Unblock ${blockTarget?.name}?` : `Block ${blockTarget?.name}?`}
        message={
          blockTarget?.isBlocked
            ? "This will restore their access to the platform."
            : "This will prevent them from accessing the platform."
        }
        confirmLabel={blockTarget?.isBlocked ? "Unblock User" : "Block User"}
        confirmVariant={blockTarget?.isBlocked ? "success" : "danger"}
        onConfirm={handleBlockConfirm}
        onCancel={() => !blocking && setBlockTarget(null)}
        loading={blocking}
      />
    </div>
  );
}

export default AdminUsersPage;
