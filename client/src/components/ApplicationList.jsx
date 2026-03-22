/**
 * ApplicationList component displays a list of job applications
 * Shows key application information and action buttons
 */
export function ApplicationList({ applications, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading applications...</p>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyStateText}>No applications yet</p>
        <p style={styles.emptyStateSubtext}>
          Click "Add Application" to track your first job application
        </p>
      </div>
    );
  }

  return (
    <div style={styles.listContainer}>
      {applications.map((app) => (
        <div key={app.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.company}>{app.company}</h3>
              <p style={styles.position}>{app.position}</p>
            </div>
            <div style={styles.statusBadge({ status: app.status })}>
              {app.status}
            </div>
          </div>

          <div style={styles.cardBody}>
            <div style={styles.detail}>
              <span style={styles.label}>Applied:</span>
              <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
            </div>
            {app.notes && (
              <div style={styles.detail}>
                <span style={styles.label}>Notes:</span>
                <span style={styles.notesText}>{app.notes}</span>
              </div>
            )}
          </div>

          <div style={styles.cardFooter}>
            <button onClick={() => onEdit(app.id)} style={styles.editButton}>
              Edit
            </button>
            <button
              onClick={() => onDelete(app.id)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const statusColors = {
  APPLIED: "#9ca3af",
  INTERVIEW: "#3b82f6",
  OFFER: "#10b981",
  REJECTED: "#ef4444",
};

const styles = {
  listContainer: {
    display: "grid",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#f9fafb",
    padding: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
  },
  company: {
    fontSize: "1.125rem",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 0.25rem 0",
  },
  position: {
    fontSize: "0.95rem",
    color: "#6b7280",
    margin: "0",
  },
  statusBadge: ({ status }) => ({
    backgroundColor: statusColors[status] || "#9ca3af",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "600",
    whiteSpace: "nowrap",
  }),
  cardBody: {
    padding: "1.5rem",
    borderTop: "1px solid #e5e7eb",
  },
  detail: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.75rem",
    gap: "1rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    minWidth: "80px",
  },
  notesText: {
    fontSize: "0.875rem",
    color: "#6b7280",
    fontStyle: "italic",
    wordBreak: "break-word",
  },
  cardFooter: {
    backgroundColor: "#f9fafb",
    padding: "1rem 1.5rem",
    display: "flex",
    gap: "0.75rem",
    borderTop: "1px solid #e5e7eb",
  },
  editButton: {
    flex: "1",
    padding: "0.5rem 1rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 200ms",
  },
  deleteButton: {
    flex: "1",
    padding: "0.5rem 1rem",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 200ms",
  },
  loadingContainer: {
    padding: "2rem",
    textAlign: "center",
    backgroundColor: "#white",
    borderRadius: "12px",
    color: "#6b7280",
  },
  emptyState: {
    padding: "3rem 2rem",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    border: "1px dashed #d1d5db",
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 0.5rem 0",
  },
  emptyStateSubtext: {
    fontSize: "0.95rem",
    color: "#6b7280",
    margin: "0",
  },
};
