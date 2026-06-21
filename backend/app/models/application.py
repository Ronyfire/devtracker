from app.extensions import db
from app.constants import STATUSES, SOURCES, LOCATION_TYPES


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    company = db.Column(db.String(255), nullable=False)
    role_title = db.Column(db.String(255), nullable=False)
    job_url = db.Column(db.String(500), nullable=True)
    source = db.Column(db.Enum(*SOURCES, name="source_enum"), nullable=True)
    salary = db.Column(db.String(100), nullable=True)
    location_type = db.Column(db.Enum(*LOCATION_TYPES, name="location_type_enum"), nullable=True)
    posted_date = db.Column(db.Date, nullable=True)
    next_action_date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    current_status = db.Column(
        db.Enum(*STATUSES, name="status_enum"),
        nullable=False,
        default="Applied",
    )

    status_history = db.relationship(
        "StatusHistory",
        backref="application",
        cascade="all, delete-orphan",
        lazy=True,
        order_by="StatusHistory.changed_at",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "company": self.company,
            "role_title": self.role_title,
            "job_url": self.job_url,
            "source": self.source,
            "salary": self.salary,
            "location_type": self.location_type,
            "posted_date": self.posted_date.isoformat() if self.posted_date else None,
            "next_action_date": self.next_action_date.isoformat() if self.next_action_date else None,
            "notes": self.notes,
            "current_status": self.current_status,
        }
