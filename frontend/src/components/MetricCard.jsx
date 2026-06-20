export default function MetricCard({ label, value, icon, accentColor }) {
  return (
    <div className="card metric-card h-100" style={{ borderTop: `3px solid ${accentColor}` }}>
      <div className="card-body py-3">
        <i className={`bi ${icon} metric-icon`} style={{ color: accentColor }} aria-hidden="true" />
        <div className="metric-value">{value}</div>
        <div className="metric-label mt-1">{label}</div>
      </div>
    </div>
  );
}
