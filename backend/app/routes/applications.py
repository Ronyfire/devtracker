from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Application, StatusHistory
from app.constants import STATUSES, SOURCES, LOCATION_TYPES
from app.utils import parse_date

applications_bp = Blueprint("applications", __name__, url_prefix="/api/applications")


def _get_or_404(application_id, user_id):
    return Application.query.filter_by(id=application_id, user_id=user_id).first()


@applications_bp.route("/", methods=["GET"])
@jwt_required()
def list_applications():
    user_id = int(get_jwt_identity())
    status = request.args.get("status")

    query = Application.query.filter_by(user_id=user_id)
    if status:
        if status not in STATUSES:
            return jsonify({"error": f"Invalid status. Valid values: {', '.join(STATUSES)}"}), 400
        query = query.filter_by(current_status=status)

    return jsonify([app.to_dict() for app in query.all()])


@applications_bp.route("/", methods=["POST"])
@jwt_required()
def create_application():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    company = (data.get("company") or "").strip()
    role_title = (data.get("role_title") or "").strip()
    if not company or not role_title:
        return jsonify({"error": "company and role_title are required"}), 400

    source = data.get("source")
    if source and source not in SOURCES:
        return jsonify({"error": f"Invalid source. Valid values: {', '.join(SOURCES)}"}), 400

    location_type = data.get("location_type")
    if location_type and location_type not in LOCATION_TYPES:
        return jsonify({"error": f"Invalid location_type. Valid values: {', '.join(LOCATION_TYPES)}"}), 400

    try:
        posted_date = parse_date(data.get("posted_date"))
        next_action_date = parse_date(data.get("next_action_date"))
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    application = Application(
        user_id=user_id,
        company=company,
        role_title=role_title,
        job_url=data.get("job_url"),
        source=source,
        salary=data.get("salary"),
        location_type=location_type,
        posted_date=posted_date,
        next_action_date=next_action_date,
        current_status="Applied",
    )
    db.session.add(application)
    db.session.flush()  # populates application.id before the commit

    db.session.add(StatusHistory(
        application_id=application.id,
        status="Applied",
        notes=data.get("notes"),
    ))
    db.session.commit()

    return jsonify(application.to_dict()), 201


@applications_bp.route("/<int:application_id>", methods=["GET"])
@jwt_required()
def get_application(application_id):
    user_id = int(get_jwt_identity())
    application = _get_or_404(application_id, user_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404
    return jsonify(application.to_dict())


@applications_bp.route("/<int:application_id>", methods=["PUT"])
@jwt_required()
def update_application(application_id):
    user_id = int(get_jwt_identity())
    application = _get_or_404(application_id, user_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    data = request.get_json()

    if "company" in data:
        application.company = (data["company"] or "").strip()
    if "role_title" in data:
        application.role_title = (data["role_title"] or "").strip()
    if "job_url" in data:
        application.job_url = data["job_url"]
    if "salary" in data:
        application.salary = data["salary"]

    if "source" in data:
        if data["source"] and data["source"] not in SOURCES:
            return jsonify({"error": f"Invalid source. Valid values: {', '.join(SOURCES)}"}), 400
        application.source = data["source"]

    if "location_type" in data:
        if data["location_type"] and data["location_type"] not in LOCATION_TYPES:
            return jsonify({"error": f"Invalid location_type. Valid values: {', '.join(LOCATION_TYPES)}"}), 400
        application.location_type = data["location_type"]

    try:
        if "posted_date" in data:
            application.posted_date = parse_date(data["posted_date"])
        if "next_action_date" in data:
            application.next_action_date = parse_date(data["next_action_date"])
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    db.session.commit()
    return jsonify(application.to_dict())


@applications_bp.route("/<int:application_id>", methods=["DELETE"])
@jwt_required()
def delete_application(application_id):
    user_id = int(get_jwt_identity())
    application = _get_or_404(application_id, user_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    db.session.delete(application)
    db.session.commit()
    return "", 204


@applications_bp.route("/<int:application_id>/status", methods=["POST"])
@jwt_required()
def add_status(application_id):
    user_id = int(get_jwt_identity())
    application = _get_or_404(application_id, user_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    data = request.get_json()
    status = data.get("status")
    if not status or status not in STATUSES:
        return jsonify({"error": f"Invalid status. Valid values: {', '.join(STATUSES)}"}), 400

    entry = StatusHistory(
        application_id=application.id,
        status=status,
        notes=data.get("notes"),
    )
    db.session.add(entry)
    application.current_status = status  # keep denormalized field in sync
    db.session.commit()

    return jsonify(entry.to_dict()), 201


@applications_bp.route("/<int:application_id>/history", methods=["GET"])
@jwt_required()
def get_history(application_id):
    user_id = int(get_jwt_identity())
    application = _get_or_404(application_id, user_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    return jsonify([entry.to_dict() for entry in application.status_history])
