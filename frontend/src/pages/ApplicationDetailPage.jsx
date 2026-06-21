import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import ApplicationModal from "../components/ApplicationModal";
import StatusModal from "../components/StatusModal";
import { getApplication, updateApplication, addStatus, getHistory } from "../services/applications";
import "../styles/ApplicationDetail.css";

const STATUS_COLORS = {
  "Applied":             "#0d6efd",
  "Screening":           "#6f42c1",
  "Technical Interview": "#fd7e14",
  "Final Interview":     "#0dcaf0",
  "Offer":               "#198754",
  "Rejected":            "#dc3545",
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IE", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IE", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getApplication(id), getHistory(id)])
      .then(([appRes, histRes]) => {
        setApplication(appRes.data);
        setHistory(histRes.data);
      })
      .catch(() => setError("Failed to load application."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEditSave = async (formData) => {
    const cleaned = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => v !== "")
    );
    const { data } = await updateApplication(id, cleaned);
    setApplication(data);
  };

  const handleStatusSave = async (status, notes) => {
    const { data } = await addStatus(id, { status, notes: notes || undefined });
    setApplication((prev) => ({ ...prev, current_status: status }));
    setHistory((prev) => [...prev, data]);
  };

  if (loading) {
    return <div className="container-xl py-5 text-center text-muted">Loading…</div>;
  }

  if (error || !application) {
    return (
      <div className="container-xl py-5">
        <div className="alert alert-danger">{error || "Application not found."}</div>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/")}>
          ← Back to dashboard
        </button>
      </div>
    );
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.changed_at) - new Date(b.changed_at)
  );

  return (
    <>
      <div className="container-xl py-4">
        <button
          className="btn btn-link text-muted ps-0 mb-3 text-decoration-none"
          onClick={() => navigate("/")}
        >
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />
          Back to dashboard
        </button>

        {/* Header */}
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-5">
          <div>
            <h1 className="mb-1">{application.company}</h1>
            <p className="text-muted mb-2">{application.role_title}</p>
            <StatusBadge status={application.current_status} />
          </div>
          <div className="d-flex gap-2 flex-shrink-0">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowEditModal(true)}
            >
              <i className="bi bi-pencil me-1" aria-hidden="true" />
              Edit
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowStatusModal(true)}
            >
              <i className="bi bi-arrow-right-circle me-1" aria-hidden="true" />
              Change status
            </button>
          </div>
        </div>

        <div className="row g-4">
          {/* Details card */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h6 className="fw-bold text-uppercase text-muted small mb-3 ls-wide">
                  Details
                </h6>
                <dl className="row gy-3 mb-0">
                  <div className="col-6">
                    <dt className="detail-field-label">Source</dt>
                    <dd className="detail-field-value mb-0">{application.source ?? "—"}</dd>
                  </div>
                  <div className="col-6">
                    <dt className="detail-field-label">Location</dt>
                    <dd className="detail-field-value mb-0">{application.location_type ?? "—"}</dd>
                  </div>
                  <div className="col-6">
                    <dt className="detail-field-label">Salary</dt>
                    <dd className="detail-field-value mb-0">{application.salary ?? "—"}</dd>
                  </div>
                  <div className="col-6">
                    <dt className="detail-field-label">Posted</dt>
                    <dd className="detail-field-value mb-0">{formatDate(application.posted_date)}</dd>
                  </div>
                  <div className="col-6">
                    <dt className="detail-field-label">Next action</dt>
                    <dd className="detail-field-value mb-0">{formatDate(application.next_action_date)}</dd>
                  </div>
                  {application.job_url && (
                    <div className="col-12">
                      <dt className="detail-field-label">Job URL</dt>
                      <dd className="detail-field-value mb-0">
                        <a
                          href={application.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-break"
                        >
                          {application.job_url}
                        </a>
                      </dd>
                    </div>
                  )}
                  {application.notes && (
                    <div className="col-12">
                      <dt className="detail-field-label">Notes</dt>
                      <dd
                        className="detail-field-value mb-0 text-muted"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {application.notes}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* History timeline */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h6 className="fw-bold text-uppercase text-muted small mb-3">
                  Status history
                </h6>
                {sortedHistory.length === 0 ? (
                  <p className="text-muted small">No history yet.</p>
                ) : (
                  <ol className="timeline list-unstyled mb-0">
                    {sortedHistory.map((entry) => (
                      <li key={entry.id} className="timeline-item">
                        <span
                          className="timeline-dot"
                          style={{ backgroundColor: STATUS_COLORS[entry.status] ?? "#6c757d" }}
                        />
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div>
                            <span className="timeline-status">{entry.status}</span>
                            {entry.notes && (
                              <p className="text-muted small mb-0 mt-1">{entry.notes}</p>
                            )}
                          </div>
                          <span className="timeline-date text-nowrap flex-shrink-0">
                            {formatDateTime(entry.changed_at)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <ApplicationModal
          application={application}
          onSave={handleEditSave}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showStatusModal && (
        <StatusModal
          application={application}
          onSave={handleStatusSave}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </>
  );
}
