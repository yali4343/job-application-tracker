import { useState } from "react";
import "../components/ComponentStyles.css";

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
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search by company, position, or notes..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="input"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={selectedStatus}
          onChange={handleStatusChange}
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
        <div className="filter-actions">
          <button onClick={handleReset} className="button button-secondary">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
