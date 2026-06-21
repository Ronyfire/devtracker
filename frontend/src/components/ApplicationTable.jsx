import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

export default function ApplicationTable({ applications, onDelete, onEdit }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover applications-table mb-0">
        <thead>
          <tr>
            <th scope="col">Company</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Source</th>
            <th scope="col">Location</th>
            <th scope="col">Next action</th>
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>
                <Link
                  to={`/applications/${app.id}`}
                  className="fw-semibold text-dark text-decoration-none"
                >
                  {app.company}
                </Link>
              </td>
              <td>{app.role_title}</td>
              <td><StatusBadge status={app.current_status} /></td>
              <td className="text-muted">{app.source ?? "—"}</td>
              <td className="text-muted">{app.location_type ?? "—"}</td>
              <td className="text-muted">{app.next_action_date ?? "—"}</td>
              <td>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => onEdit(app)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onDelete(app.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
