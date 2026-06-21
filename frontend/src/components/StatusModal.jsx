import { useState } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import StatusBadge from "./StatusBadge";

const STATUSES = ["Applied", "Screening", "Technical Interview", "Final Interview", "Offer", "Rejected"];

export default function StatusModal({ application, onSave, onClose }) {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useFocusTrap(onClose);

  const available = STATUSES.filter((s) => s !== application.current_status);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) return;
    setError("");
    setLoading(true);
    try {
      await onSave(status, notes);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update status.");
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-modal-title"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 id="status-modal-title" className="modal-title fw-bold">Change status</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p className="text-muted small mb-3">
                Current: <StatusBadge status={application.current_status} />
              </p>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              <div className="mb-3">
                <label className="form-label">New status *</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  autoFocus
                >
                  <option value="">— Select —</option>
                  {available.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional — what happened at this stage?"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || !status}>
                {loading ? "Saving…" : "Update status"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
