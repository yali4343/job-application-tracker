import { useState } from "react";

/**
 * FilterBar component for searching and filtering applications
 * Supports:
 * - Search by company, position, or notes
 * - Filter by application status
 */
export function FilterBar({ onSearch, onStatusFilter, onReset }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const statuses = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setSelectedStatus(value);
    onStatusFilter(value);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedStatus("");
    onReset();
  };

  return (
    <div style={styles.container}>
      <div style={styles.filterGroup}>
        <input
          type="text"
          placeholder="Search by company, position, or notes..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.filterGroup}>
        <select
          value={selectedStatus}
          onChange={handleStatusChange}
          style={styles.statusSelect}
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {(searchQuery || selectedStatus) && (
        <button onClick={handleReset} style={styles.resetButton}>
          Clear filters
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "2rem",
  },
  filterGroup: {
    flex: "1",
    minWidth: "200px",
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  statusSelect: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  resetButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 200ms",
  },
};
