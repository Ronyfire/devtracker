import StatusBadge from "./StatusBadge";

export default function ApplicationTable({ applications, onDelete }) {
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
              <td className="fw-semibold">{app.company}</td>
              <td>{app.role_title}</td>
              <td><StatusBadge status={app.current_status} /></td>
              <td className="text-muted">{app.source ?? "—"}</td>
              <td className="text-muted">{app.location_type ?? "—"}</td>
              <td className="text-muted">{app.next_action_date ?? "—"}</td>
              <td>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onDelete(app.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
