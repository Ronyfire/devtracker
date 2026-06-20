from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate, jwt
from .config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    from . import models  # noqa: F401 — required for Flask-Migrate to detect models

    from .routes.auth import auth_bp
    from .routes.applications import applications_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(applications_bp)

    return app
