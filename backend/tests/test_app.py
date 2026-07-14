from flask import Flask


def test_app_factory_creates_app(app):
    assert isinstance(app, Flask)
    assert "auth" in app.blueprints
    assert "applications" in app.blueprints


def test_app_responds_without_crashing(client):
    # No dedicated health-check route exists yet — hitting an unregistered
    # path still proves the WSGI stack is wired up and dispatching cleanly.
    response = client.get("/")
    assert response.status_code == 404
