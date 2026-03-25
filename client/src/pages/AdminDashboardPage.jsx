import { useState, useEffect } from "react";
import { getAdminStats } from "../services/adminService";
import { FiUsers, FiHome, FiEye, FiUserCheck } from "react-icons/fi";
import { BiTrendingUp } from "react-icons/bi";
import "./AdminDashboardPage.css";

function AdminStatCard({ icon, iconBg, number, label, secondary }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card__top">
        <div className="admin-stat-card__icon" style={{ background: iconBg }}>
          {icon}
        </div>
        <span className="admin-stat-card__label">{label}</span>
      </div>
      <span className="admin-stat-card__number">{number}</span>
      {secondary && (
        <span className="admin-stat-card__secondary">{secondary}</span>
      )}
    </div>
  );
}

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      const message = err.response?.data?.error || "Failed to load admin stats";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          const message = err.response?.data?.error || "Failed to load admin stats";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <h1 className="admin-page__title">Dashboard</h1>
        <div className="admin-stats-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="admin-stat-card admin-stat-card--skeleton">
              <div className="admin-skeleton-line admin-skeleton-short" />
              <div className="admin-skeleton-line admin-skeleton-large" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <h1 className="admin-page__title">Dashboard</h1>
        <div className="admin-error">
          <p>{error}</p>
          <button className="admin-btn admin-btn--primary" onClick={fetchStats}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activeSecondary = `${stats?.activeListings ?? 0} active / ${stats?.pausedListings ?? 0} paused`;

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Dashboard</h1>
      <div className="admin-stats-grid">
        <AdminStatCard
          icon={<FiUsers size={22} color="#FFFFFF" />}
          iconBg="#3B82F6"
          number={stats?.totalUsers ?? 0}
          label="Total Users"
        />
        <AdminStatCard
          icon={<FiHome size={22} color="#FFFFFF" />}
          iconBg="#8B5CF6"
          number={stats?.totalListings ?? 0}
          label="Total Listings"
        />
        <AdminStatCard
          icon={<BiTrendingUp size={22} color="#FFFFFF" />}
          iconBg="#10B981"
          number={stats?.totalListings ?? 0}
          label="Listings Breakdown"
          secondary={activeSecondary}
        />
        <AdminStatCard
          icon={<FiEye size={22} color="#FFFFFF" />}
          iconBg="#F59E0B"
          number={stats?.totalViews ?? 0}
          label="Total Views"
        />
        <AdminStatCard
          icon={<FiUserCheck size={22} color="#FFFFFF" />}
          iconBg="#EC4899"
          number={stats?.totalLeads ?? 0}
          label="Total Leads"
        />
      </div>
    </div>
  );
}

export default AdminDashboardPage;
