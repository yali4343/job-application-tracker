import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getApplication,
  updateApplication,
} from "../services/applicationService.js";

export function EditApplicationPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    status: "APPLIED",
    appliedDate: "",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch application data on mount
  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getApplication(id);
      const app = data.application;

      // Format date for input field (YYYY-MM-DD)
      const dateObj = new Date(app.appliedDate);
      const formattedDate = dateObj.toISOString().split("T")[0];

      setFormData({
        company: app.company,
        position: app.position,
        status: app.status,
        appliedDate: formattedDate,
        notes: app.notes || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load application.");
      console.error("Error fetching application:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

    setIsSubmitting(true);
    try {
      await updateApplication(id, {
        company: formData.company.trim(),
        position: formData.position.trim(),
        status: formData.status,
        appliedDate: new Date(formData.appliedDate).toISOString(),
        notes: formData.notes.trim(),
      });

      // Success - redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update application.");
      console.error("Error updating application:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Job Tracker</h1>
        </header>
        <main style={styles.main}>
          <div style={styles.formCard}>
            <p>Loading application...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Job Tracker</h1>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Edit Application</h2>

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

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Company */}
            <div style={styles.formGroup}>
              <label htmlFor="company" style={styles.label}>
                Company <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                placeholder="e.g., Google"
                value={formData.company}
                onChange={handleChange}
                style={styles.input}
                disabled={isSubmitting}
              />
            </div>

            {/* Position */}
            <div style={styles.formGroup}>
              <label htmlFor="position" style={styles.label}>
                Position <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="position"
                name="position"
                placeholder="e.g., Software Engineer"
                value={formData.position}
                onChange={handleChange}
                style={styles.input}
                disabled={isSubmitting}
              />
            </div>

            {/* Applied Date */}
            <div style={styles.formGroup}>
              <label htmlFor="appliedDate" style={styles.label}>
                Application Date <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="appliedDate"
                name="appliedDate"
                value={formData.appliedDate}
                onChange={handleChange}
                style={styles.input}
                disabled={isSubmitting}
              />
            </div>

            {/* Status */}
            <div style={styles.formGroup}>
              <label htmlFor="status" style={styles.label}>
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
                disabled={isSubmitting}
              >
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Job Description */}
            <div style={styles.formGroup}>
              <label htmlFor="notes" style={styles.label}>
                Job Description
              </label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Add the job description..."
                value={formData.notes}
                onChange={handleChange}
                style={styles.textarea}
                disabled={isSubmitting}
                rows="4"
              />
            </div>

            {/* Buttons */}
            <div style={styles.buttonGroup}>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.cancelButton}
                disabled={isSubmitting}
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

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "2rem",
    textAlign: "center",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0",
  },
  main: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "0 1rem",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "0.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "2rem",
  },
  formTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "1.5rem",
    marginTop: "0",
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "1rem",
    borderRadius: "0.375rem",
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorCloseButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#991b1b",
    fontSize: "1.25rem",
    cursor: "pointer",
    padding: "0",
    marginLeft: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    padding: "0.5rem 0.75rem",
    fontSize: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontFamily: "inherit",
  },
  select: {
    padding: "0.5rem 0.75rem",
    fontSize: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontFamily: "inherit",
    backgroundColor: "#ffffff",
  },
  textarea: {
    padding: "0.5rem 0.75rem",
    fontSize: "1rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontFamily: "inherit",
    resize: "vertical",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  submitButton: {
    flex: 1,
    padding: "0.75rem 1.5rem",
    backgroundColor: "#059669",
    color: "#ffffff",
    border: "none",
    borderRadius: "0.375rem",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  cancelButton: {
    flex: 1,
    padding: "0.75rem 1.5rem",
    backgroundColor: "#e5e7eb",
    color: "#1f2937",
    border: "none",
    borderRadius: "0.375rem",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};
