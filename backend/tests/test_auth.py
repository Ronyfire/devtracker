import bcrypt

from app.extensions import db
from app.models import User


def _create_user(email="test@example.com", password="supersecret123"):
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(email=email, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()
    return user


def test_protected_endpoint_requires_token(client):
    response = client.get("/api/applications/")
    assert response.status_code == 401


def test_login_with_valid_credentials_returns_token(client):
    _create_user(email="test@example.com", password="supersecret123")

    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "supersecret123"},
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["token"]


def test_login_with_wrong_password_returns_401(client):
    _create_user(email="test2@example.com", password="supersecret123")

    response = client.post(
        "/api/auth/login",
        json={"email": "test2@example.com", "password": "wrongpassword"},
    )

    assert response.status_code == 401
