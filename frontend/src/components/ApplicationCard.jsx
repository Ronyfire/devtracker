import StatusBadge from "./StatusBadge";

export default function ApplicationCard({ application, onDelete }) {
  const { company, role_title, current_status, source, location_type, next_action_date } = application;

  return (
    <div className="application-card card mb-3 p-3">
      <div className="d-flex justify-content-between align-items-start mb-1">
        <div>
          <div className="fw-semibold">{company}</div>
          <div className="text-muted small">{role_title}</div>
        </div>
        <StatusBadge status={current_status} />
      </div>
      <div className="d-flex flex-wrap gap-2 mt-2 small text-muted">
        {source && <span>{source}</span>}
        {location_type && <span>· {location_type}</span>}
        {next_action_date && <span>· Next: {next_action_date}</span>}
      </div>
      <div className="mt-2 text-end">
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => onDelete(application.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
