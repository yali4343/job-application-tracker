import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { ApplicationList } from "../components/ApplicationList.jsx";
import { FilterBar } from "../components/FilterBar.jsx";
import {
  getApplications,
  deleteApplication,
} from "../services/applicationService.js";
import "../components/ComponentStyles.css";

export function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Apply filters when data or filter values change
  useEffect(() => {
    applyFilters();
  }, [applications, searchQuery, statusFilter]);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getApplications();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load applications.");
      console.error("Error fetching applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = applications;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.company?.toLowerCase().includes(query) ||
          app.position?.toLowerCase().includes(query) ||
          app.notes?.toLowerCase().includes(query),
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleAddApplication = () => {
    navigate("/applications/new");
  };

  const handleEditApplication = (id) => {
    navigate(`/applications/${id}/edit`);
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      await deleteApplication(id);
      setApplications(applications.filter((app) => app.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete application.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">Job Tracker</h1>
          <p className="dashboard-subtitle">Manage your job applications</p>
        </div>
        <button
          onClick={handleLogout}
          className="button button-danger dashboard-logout-btn"
        >
          Sign out
        </button>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* User Greeting */}
        <div className="dashboard-greeting-card">
          <h2 className="dashboard-greeting">Welcome, {user?.name}!</h2>
          <p className="dashboard-greeting-text">
            You have <strong>{applications.length}</strong>{" "}
            {applications.length === 1 ? "application" : "applications"}{" "}
            tracked.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="dashboard-error-banner">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="dashboard-error-close"
            >
              ×
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="dashboard-action-bar">
          <button
            onClick={handleAddApplication}
            className="button button-success dashboard-add-btn"
          >
            + Add Application
          </button>
        </div>

        {/* Filter Bar */}
        {applications.length > 0 && (
          <FilterBar
            onSearch={setSearchQuery}
            onStatusFilter={setStatusFilter}
            onReset={() => {
              setSearchQuery("");
              setStatusFilter("");
            }}
          />
        )}

        {/* Applications List */}
        <ApplicationList
          applications={filteredApplications}
          onEdit={handleEditApplication}
          onDelete={handleDeleteApplication}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
