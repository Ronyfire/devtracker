import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-real-use")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret-key-not-for-real-use")

import pytest
from sqlalchemy.pool import StaticPool

from app import create_app
from app.extensions import db


class TestConfig:
    SECRET_KEY = "test-secret-key-not-for-real-use"
    JWT_SECRET_KEY = "test-jwt-secret-key-not-for-real-use"
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "poolclass": StaticPool,
        "connect_args": {"check_same_thread": False},
    }
    TESTING = True


@pytest.fixture
def app():
    flask_app = create_app(TestConfig)
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()
