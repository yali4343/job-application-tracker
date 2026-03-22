import "../components/ComponentStyles.css";

/**
 * ApplicationList component displays a list of job applications
 * Shows key application information and action buttons
 */
export function ApplicationList({ applications, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="application-loading">
        <p>Loading applications...</p>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="application-empty-state">
        <p className="application-empty-state-title">No applications yet</p>
        <p className="application-empty-state-description">
          Click "Add Application" to track your first job application
        </p>
      </div>
    );
  }

  return (
    <div className="application-list">
      {applications.map((app) => (
        <div key={app.id} className="application-card">
          <div className="application-card-header">
            <div className="application-card-header-content">
              <h3 className="application-company">{app.company}</h3>
              <p className="application-position">{app.position}</p>
            </div>
            <div
              className={`application-status-badge ${app.status.toLowerCase()}`}
            >
              {app.status}
            </div>
          </div>

          <div className="application-card-body">
            <div className="application-detail">
              <span className="application-detail-label">Applied:</span>
              <span className="application-detail-value">
                {new Date(app.appliedDate).toLocaleDateString()}
              </span>
            </div>
            {app.notes && (
              <div className="application-detail">
                <span className="application-detail-label">Notes:</span>
                <span className="application-detail-value application-notes">
                  {app.notes}
                </span>
              </div>
            )}
          </div>

          <div className="application-card-footer">
            <button
              onClick={() => onEdit(app.id)}
              className="button button-primary"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(app.id)}
              className="button button-danger"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
