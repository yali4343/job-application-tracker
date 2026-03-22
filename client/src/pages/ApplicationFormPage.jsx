import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createApplication } from "../services/applicationService.js";
import "../components/ComponentStyles.css";

export function ApplicationFormPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    status: "APPLIED",
    appliedDate: new Date().toISOString().split("T")[0],
    notes: "",
    resumeLink: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.company.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!formData.position.trim()) {
      setError("Position is required.");
      return;
    }
    if (!formData.appliedDate) {
      setError("Application date is required.");
      return;
    }

    setIsLoading(true);
    try {
      await createApplication({
        company: formData.company.trim(),
        position: formData.position.trim(),
        status: formData.status,
        appliedDate: new Date(formData.appliedDate).toISOString(),
        notes: formData.notes.trim(),
        resumeLink: formData.resumeLink.trim(),
      });

      // Success - redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create application.");
      console.error("Error creating application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="form-container">
      {/* Header */}
      <header className="form-header">
        <h1 className="form-header-title">Job Tracker</h1>
      </header>

      {/* Main Content */}
      <main className="form-main">
        <div className="form-card">
          <h2 className="form-title">Add New Application</h2>

          {error && (
            <div className="form-error-banner">
              <span>{error}</span>
              <button onClick={() => setError("")} className="form-error-close">
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            {/* Company */}
            <div className="form-group">
              <label htmlFor="company" className="form-label">
                Company <span className="form-required">*</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                placeholder="e.g., Google"
                value={formData.company}
                onChange={handleChange}
                className="form-input"
                disabled={isLoading}
              />
            </div>

            {/* Position */}
            <div className="form-group">
              <label htmlFor="position" className="form-label">
                Position <span className="form-required">*</span>
              </label>
              <input
                type="text"
                id="position"
                name="position"
                placeholder="e.g., Software Engineer"
                value={formData.position}
                onChange={handleChange}
                className="form-input"
                disabled={isLoading}
              />
            </div>

            {/* Applied Date */}
            <div className="form-group">
              <label htmlFor="appliedDate" className="form-label">
                Application Date <span className="form-required">*</span>
              </label>
              <input
                type="date"
                id="appliedDate"
                name="appliedDate"
                value={formData.appliedDate}
                onChange={handleChange}
                className="form-input"
                disabled={isLoading}
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
                disabled={isLoading}
              >
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Job Description */}
            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Job Description
              </label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Add the job description..."
                value={formData.notes}
                onChange={handleChange}
                className="form-textarea"
                disabled={isLoading}
                rows="4"
              />
            </div>

            {/* Resume Link */}
            <div className="form-group">
              <label htmlFor="resumeLink" className="form-label">
                Resume Link
              </label>
              <input
                type="url"
                id="resumeLink"
                name="resumeLink"
                placeholder="e.g., https://docs.google.com/document/d/..."
                value={formData.resumeLink}
                onChange={handleChange}
                className="form-input"
                disabled={isLoading}
              />
            </div>

            {/* Buttons */}
            <div className="form-button-group">
              <button
                type="submit"
                className="button button-success form-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Application"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="button form-cancel-btn"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
