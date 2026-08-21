import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAdminStats,
  getAdminUsers,
  getAdminRequests,
  blockUser,
  unblockUser,
  deleteUser,
} from "../services/api";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =====================================
  // CHECK ADMIN
  // =====================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("nearbyfix_user");

    if (!storedUser) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "admin") {
        navigate("/login", {
          replace: true,
        });
      }
    } catch (error) {
      localStorage.removeItem("nearbyfix_user");
      localStorage.removeItem("nearbyfix_token");

      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  // =====================================
  // LOAD STATS
  // =====================================

  const loadStats = async () => {
    try {
      const data = await getAdminStats();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error(
        "ADMIN STATS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load statistics"
      );
    }
  };

  // =====================================
  // LOAD USERS
  // =====================================

  const loadUsers = async () => {
    try {
      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      const data = await getAdminUsers(params);

      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error(
        "ADMIN USERS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load users"
      );
    }
  };

  // =====================================
  // LOAD REQUESTS
  // =====================================

  const loadRequests = async () => {
    try {
      const data = await getAdminRequests();

      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error(
        "ADMIN REQUESTS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load requests"
      );
    }
  };

  // =====================================
  // LOAD ALL DATA
  // =====================================

  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    await Promise.all([
      loadStats(),
      loadUsers(),
      loadRequests(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // =====================================
  // SEARCH USERS
  // =====================================

  useEffect(() => {
    if (activeTab === "users") {
      const timeout = setTimeout(() => {
        loadUsers();
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [
    search,
    roleFilter,
    activeTab,
  ]);

  // =====================================
  // TAB CHANGE
  // =====================================

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // =====================================
  // BLOCK / UNBLOCK
  // =====================================

  const handleBlockToggle = async (user) => {
    try {
      setActionLoading(user._id);

      if (user.isBlocked) {
        await unblockUser(user._id);
      } else {
        const confirmed = window.confirm(
          `Block ${user.name}?`
        );

        if (!confirmed) {
          setActionLoading(null);
          return;
        }

        await blockUser(user._id);
      }

      await Promise.all([
        loadUsers(),
        loadStats(),
      ]);

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Action failed"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================
  // DELETE USER
  // =====================================

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name} permanently?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(user._id);

      await deleteUser(user._id);

      await Promise.all([
        loadUsers(),
        loadStats(),
        loadRequests(),
      ]);

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Failed to delete user"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {
    localStorage.removeItem("nearbyfix_token");
    localStorage.removeItem("nearbyfix_user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-loading">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="admin-container">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={
          sidebarOpen
            ? "admin-sidebar open"
            : "admin-sidebar"
        }
      >
        <div className="admin-sidebar-top">

          <div className="admin-brand">
            <h2>NearbyFix</h2>

            <p>Admin Panel</p>
          </div>

          <button
            className="mobile-close"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            ×
          </button>

          <div className="admin-menu">

            <button
              className={
                activeTab === "dashboard"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeTab("dashboard")
              }
            >
              Dashboard
            </button>

            <button
              className={
                activeTab === "users"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeTab("users")
              }
            >
              Users
            </button>

            <button
              className={
                activeTab === "requests"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeTab("requests")
              }
            >
              Service Requests
            </button>

          </div>
        </div>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* MAIN */}

      <main className="admin-main">

        <div className="admin-header">

          <div className="admin-header-left">

            <button
              className="mobile-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              ☰
            </button>

            <div>
              <h1>Admin Dashboard</h1>

              <p>
                Manage NearbyFix users and services
              </p>
            </div>

          </div>

          <button
            className="admin-refresh"
            onClick={loadAdminData}
          >
            Refresh
          </button>

        </div>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {/* DASHBOARD */}

        {activeTab === "dashboard" && (
          <>
            <div className="stats-grid">

              <StatCard
                title="Total Users"
                value={stats?.totalUsers || 0}
              />

              <StatCard
                title="Customers"
                value={stats?.totalCustomers || 0}
              />

              <StatCard
                title="Technicians"
                value={
                  stats?.totalTechnicians || 0
                }
              />

              <StatCard
                title="Blocked Users"
                value={
                  stats?.blockedUsers || 0
                }
              />

              <StatCard
                title="Service Requests"
                value={
                  stats?.totalRequests || 0
                }
              />

              <StatCard
                title="Completed"
                value={
                  stats?.completedRequests || 0
                }
              />

            </div>

            <div className="admin-info-box">
              <h3>Quick Overview</h3>

              <div className="overview-grid">

                <div>
                  <span>Pending Requests</span>
                  <strong>
                    {stats?.pendingRequests || 0}
                  </strong>
                </div>

                <div>
                  <span>Total Admins</span>
                  <strong>
                    {stats?.totalAdmins || 0}
                  </strong>
                </div>

              </div>
            </div>
          </>
        )}

        {/* USERS */}

        {activeTab === "users" && (
          <>
            <div className="admin-filters">

              <input
                type="text"
                placeholder="Search name, email or phone..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value)
                }
              >
                <option value="">
                  All Roles
                </option>

                <option value="user">
                  Users
                </option>

                <option value="technician">
                  Technicians
                </option>

                <option value="admin">
                  Admins
                </option>

              </select>

            </div>

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Logins</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="empty-row"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id}>

                        <td>{user.name}</td>

                        <td>{user.email}</td>

                        <td>{user.phone}</td>

                        <td>
                          <span className="role-badge">
                            {user.role}
                          </span>
                        </td>

                        <td>
                          {user.loginCount || 0}
                        </td>

                        <td>
                          {user.lastLogin
                            ? new Date(
                                user.lastLogin
                              ).toLocaleString()
                            : "Never"}
                        </td>

                        <td>
                          <span
                            className={
                              user.isBlocked
                                ? "status blocked"
                                : "status active"
                            }
                          >
                            {user.isBlocked
                              ? "Blocked"
                              : "Active"}
                          </span>
                        </td>

                        <td>

                          <div className="action-buttons">

                            <button
                              disabled={
                                actionLoading ===
                                user._id
                              }
                              onClick={() =>
                                handleBlockToggle(user)
                              }
                              className={
                                user.isBlocked
                                  ? "unblock-button"
                                  : "block-button"
                              }
                            >
                              {actionLoading === user._id
                                ? "Loading..."
                                : user.isBlocked
                                ? "Unblock"
                                : "Block"}
                            </button>

                            <button
                              disabled={
                                actionLoading ===
                                user._id
                              }
                              onClick={() =>
                                handleDelete(user)
                              }
                              className="delete-button"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>
          </>
        )}

        {/* SERVICE REQUESTS */}

        {activeTab === "requests" && (
          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Title</th>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>

                {requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="empty-row"
                    >
                      No service requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request._id}>

                      <td>{request.title}</td>

                      <td>
                        {request.serviceType}
                      </td>

                      <td>
                        {request.user?.name ||
                          "Deleted User"}
                      </td>

                      <td>
                        {request.technician?.name ||
                          "Not Assigned"}
                      </td>

                      <td>
                        <span className="role-badge">
                          {request.status}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          request.createdAt
                        ).toLocaleString()}
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        )}

      </main>
    </div>
  );
};


// =====================================
// STAT CARD
// =====================================

const StatCard = ({
  title,
  value,
}) => {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
};

export default AdminDashboard;