import { useState } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

const SOURCES = ["LinkedIn", "Company Website", "Referral", "Indeed", "Other"];
const LOCATION_TYPES = ["Remote", "Hybrid", "Onsite"];

const EMPTY_FORM = {
  company: "",
  role_title: "",
  job_url: "",
  source: "",
  salary: "",
  location_type: "",
  posted_date: "",
  next_action_date: "",
  notes: "",
};

const initForm = (app) =>
  app
    ? {
        company: app.company ?? "",
        role_title: app.role_title ?? "",
        job_url: app.job_url ?? "",
        source: app.source ?? "",
        salary: app.salary ?? "",
        location_type: app.location_type ?? "",
        posted_date: app.posted_date ?? "",
        next_action_date: app.next_action_date ?? "",
        notes: app.notes ?? "",
      }
    : EMPTY_FORM;

export default function ApplicationModal({ application = null, onSave, onClose }) {
  const [form, setForm] = useState(() => initForm(application));
  const isEdit = application !== null;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useFocusTrap(onClose);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save. Please try again.");
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
        className="modal-dialog modal-lg modal-dialog-scrollable"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 id="modal-title" className="modal-title fw-bold">
              {isEdit ? "Edit application" : "Add application"}
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Company *</label>
                  <input className="form-control" value={form.company} onChange={set("company")} required autoFocus />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role title *</label>
                  <input className="form-control" value={form.role_title} onChange={set("role_title")} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Job URL</label>
                  <input type="url" className="form-control" value={form.job_url} onChange={set("job_url")} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Source</label>
                  <select className="form-select" value={form.source} onChange={set("source")}>
                    <option value="">— Select —</option>
                    {SOURCES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Location</label>
                  <select className="form-select" value={form.location_type} onChange={set("location_type")}>
                    <option value="">— Select —</option>
                    {LOCATION_TYPES.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Salary</label>
                  <input className="form-control" placeholder="e.g. €50k" value={form.salary} onChange={set("salary")} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Posted date</label>
                  <input type="date" className="form-control" value={form.posted_date} onChange={set("posted_date")} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Next action date</label>
                  <input type="date" className="form-control" value={form.next_action_date} onChange={set("next_action_date")} />
                </div>
                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.notes}
                    onChange={set("notes")}
                    placeholder="Referral contact, salary details, company impressions…"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving…" : isEdit ? "Save changes" : "Add application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
