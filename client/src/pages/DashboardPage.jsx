import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Job Tracker</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Sign out
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.greeting}>Welcome, {user?.name}!</h2>
          <p style={styles.description}>
            Track your job applications in one place. Manage applications, track
            status, and land your next opportunity.
          </p>

          <div style={styles.placeholder}>
            <p style={styles.placeholderText}>
              Application list, create, edit, and delete features coming soon.
            </p>
          </div>
        </div>
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
    padding: "1.5rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#111827",
    margin: "0",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "background-color 200ms",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    padding: "2rem",
  },
  greeting: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#111827",
    marginTop: "0",
    marginBottom: "0.5rem",
  },
  description: {
    fontSize: "0.95rem",
    color: "#6b7280",
    marginBottom: "2rem",
    lineHeight: "1.6",
  },
  placeholder: {
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    padding: "2rem",
    textAlign: "center",
    border: "1px dashed #d1d5db",
  },
  placeholderText: {
    color: "#9ca3af",
    fontSize: "0.95rem",
    margin: "0",
  },
};
