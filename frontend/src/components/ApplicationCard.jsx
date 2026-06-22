import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })
    : null;

export default function ApplicationCard({ application, onDelete, onEdit }) {
  const { company, role_title, current_status, source, location_type, next_action_date } = application;

  return (
    <div className="application-card card mb-3 p-3">
      <div className="d-flex justify-content-between align-items-start mb-1">
        <Link
          to={`/applications/${application.id}`}
          className="text-decoration-none text-dark flex-grow-1 me-2"
        >
          <div className="fw-semibold">{company}</div>
          <div className="text-muted small">{role_title}</div>
        </Link>
        <StatusBadge status={current_status} />
      </div>
      <div className="d-flex flex-wrap gap-2 mt-2 small text-muted">
        {source && <span>{source}</span>}
        {location_type && <span>· {location_type}</span>}
        {next_action_date && <span>· Next: {formatDate(next_action_date)}</span>}
      </div>
      <div className="mt-2 d-flex gap-2 justify-content-end">
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => onEdit(application)}
        >
          Edit
        </button>
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
