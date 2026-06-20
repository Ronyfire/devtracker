from datetime import datetime, timezone
from app.extensions import db
from app.constants import STATUSES


class StatusHistory(db.Model):
    __tablename__ = "status_history"

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey("applications.id"), nullable=False)
    status = db.Column(db.Enum(*STATUSES, name="status_enum"), nullable=False)
    changed_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "application_id": self.application_id,
            "status": self.status,
            "changed_at": self.changed_at.isoformat() if self.changed_at else None,
            "notes": self.notes,
        }
