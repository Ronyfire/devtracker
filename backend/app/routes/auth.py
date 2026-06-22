import bcrypt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(email=email, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()})


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    if "email" in data:
        new_email = (data.get("email") or "").strip().lower()
        if not new_email:
            return jsonify({"error": "Email cannot be empty"}), 400
        if new_email != user.email and User.query.filter_by(email=new_email).first():
            return jsonify({"error": "Email already in use"}), 409
        user.email = new_email

    if "new_password" in data:
        current_password = data.get("current_password") or ""
        if not bcrypt.checkpw(current_password.encode(), user.password_hash.encode()):
            return jsonify({"error": "Current password is incorrect"}), 401
        new_password = data.get("new_password") or ""
        if len(new_password) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400
        user.password_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()

    db.session.commit()
    return jsonify(user.to_dict())
