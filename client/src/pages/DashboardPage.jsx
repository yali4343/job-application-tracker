import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { ApplicationList } from "../components/ApplicationList.jsx";
import { FilterBar } from "../components/FilterBar.jsx";
import {
  getApplications,
  deleteApplication,
} from "../services/applicationService.js";

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
    // Placeholder for future "edit application" page
    alert(`Edit application ${id} - coming soon!`);
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
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Job Tracker</h1>
          <p style={styles.subtitle}>Manage your job applications</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Sign out
        </button>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* User Greeting */}
        <div style={styles.greetingCard}>
          <h2 style={styles.greeting}>Welcome, {user?.name}!</h2>
          <p style={styles.greetingText}>
            You have <strong>{applications.length}</strong>{" "}
            {applications.length === 1 ? "application" : "applications"}{" "}
            tracked.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBanner}>
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              style={styles.errorCloseButton}
            >
              ×
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div style={styles.actionBar}>
          <button onClick={handleAddApplication} style={styles.addButton}>
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

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    backgroundColor: "white",
    borderBottom: "1px solid #e5e7eb",
    padding: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#111827",
    margin: "0",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#6b7280",
    margin: "0.5rem 0 0 0",
  },
  logoutButton: {
    padding: "0.5rem 1.25rem",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 200ms",
  },
  main: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
  },
  greetingCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    marginBottom: "2rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  greeting: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 0.5rem 0",
  },
  greetingText: {
    fontSize: "0.95rem",
    color: "#6b7280",
    margin: "0",
    lineHeight: "1.6",
  },
  actionBar: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
  },
  addButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 200ms",
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorCloseButton: {
    background: "none",
    border: "none",
    color: "#991b1b",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0",
  },
};
