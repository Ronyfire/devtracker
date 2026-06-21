import { useState, useEffect, useMemo } from "react";
import MetricCard from "../components/MetricCard";
import ApplicationTable from "../components/ApplicationTable";
import ApplicationCard from "../components/ApplicationCard";
import ApplicationModal from "../components/ApplicationModal";
import { getApplications, createApplication, updateApplication, deleteApplication } from "../services/applications";
import "../styles/Dashboard.css";

const STATUSES = ["Applied", "Screening", "Technical Interview", "Final Interview", "Offer", "Rejected"];

const METRIC_CONFIG = [
  { key: "total",        label: "Total applications", icon: "bi-send",          color: "#0d6efd" },
  { key: "interviews",   label: "In interviews",       icon: "bi-people",        color: "#fd7e14" },
  { key: "offers",       label: "Offers",              icon: "bi-trophy",        color: "#198754" },
  { key: "responseRate", label: "Response rate",       icon: "bi-graph-up-arrow",color: "#6f42c1" },
];

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getApplications()
      .then(({ data }) => setApplications(data))
      .catch(() => setError("Failed to load applications."))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter((a) =>
      ["Screening", "Technical Interview", "Final Interview"].includes(a.current_status)
    ).length;
    const offers = applications.filter((a) => a.current_status === "Offer").length;
    const responseRate =
      total > 0
        ? Math.round(
            (applications.filter((a) => a.current_status !== "Applied").length / total) * 100
          )
        : 0;
    return { total, interviews, offers, responseRate };
  }, [applications]);

  const filtered = useMemo(
    () =>
      statusFilter === "All"
        ? applications
        : applications.filter((a) => a.current_status === statusFilter),
    [applications, statusFilter]
  );

  const handleModalSave = async (formData) => {
    const cleaned = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => v !== "")
    );
    if (editingApp) {
      const { data } = await updateApplication(editingApp.id, cleaned);
      setApplications((prev) => prev.map((a) => (a.id === editingApp.id ? data : a)));
    } else {
      const { data } = await createApplication(cleaned);
      setApplications((prev) => [data, ...prev]);
    }
  };

  const handleEdit = (app) => {
    setEditingApp(app);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    await deleteApplication(id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <>
      <div className="container-xl py-4">

        {/* Metric cards: 2x2 on mobile, 4 columns on desktop */}
        <div className="row row-cols-2 row-cols-md-4 g-3 mb-4">
          {METRIC_CONFIG.map(({ key, label, icon, color }) => (
            <div key={key} className="col">
              <MetricCard
                label={label}
                value={key === "responseRate" ? `${metrics[key]}%` : metrics[key]}
                icon={icon}
                accentColor={color}
              />
            </div>
          ))}
        </div>

        {/* Filters + Add button */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="filter-bar d-flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            <button
              aria-pressed={statusFilter === "All"}
              className={`btn btn-sm ${statusFilter === "All" ? "btn-dark" : "btn-outline-secondary"}`}
              onClick={() => setStatusFilter("All")}
            >
              All
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                aria-pressed={statusFilter === s}
                className={`btn btn-sm ${statusFilter === s ? "btn-dark" : "btn-outline-secondary"}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <button className="btn btn-success btn-sm" onClick={() => { setEditingApp(null); setShowModal(true); }}>
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />
            Add application
          </button>
        </div>

        {/* States */}
        {loading && <p className="text-muted">Loading…</p>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <p className="text-center text-muted py-5">
                {applications.length === 0
                  ? "No applications yet. Add your first one."
                  : "No applications match this filter."}
              </p>
            ) : (
              <>
                {/* Desktop: table */}
                <div className="d-none d-md-block">
                  <ApplicationTable applications={filtered} onDelete={handleDelete} onEdit={handleEdit} />
                </div>
                {/* Mobile: cards */}
                <div className="d-md-none">
                  {filtered.map((app) => (
                    <ApplicationCard key={app.id} application={app} onDelete={handleDelete} onEdit={handleEdit} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showModal && (
        <ApplicationModal
          application={editingApp}
          onSave={handleModalSave}
          onClose={() => { setShowModal(false); setEditingApp(null); }}
        />
      )}
    </>
  );
}

