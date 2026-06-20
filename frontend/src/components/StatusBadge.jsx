const STATUS_CLASSES = {
  Applied: "badge-applied",
  Screening: "badge-screening",
  "Technical Interview": "badge-technical",
  "Final Interview": "badge-final",
  Offer: "badge-offer",
  Rejected: "badge-rejected",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${STATUS_CLASSES[status] ?? ""}`}>
      {status}
    </span>
  );
}
