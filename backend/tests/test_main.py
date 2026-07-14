import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_endpoint():
    """Test that the backend home page/status check responds successfully."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_translate_endpoint():
    """Test the translation endpoint with Spanish query input."""
    payload = {"query": "¿Dónde puedo encontrar el ascensor?"}
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "detected_language" in data
    assert data["detected_language"] == "Spanish"
    assert "suggested_reply_native" in data

def test_incident_creation_and_listing():
    """Test reporting a new incident, verifying it is logged and retrievable."""
    payload = {"description": "Water spill near restroom block a"}
    
    # 1. Log incident
    response = client.post("/api/incident", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "hazard"
    assert data["status"] == "open"
    incident_id = data["id"]
    
    # 2. Get list of incidents
    list_response = client.get("/api/incidents")
    assert list_response.status_code == 200
    incidents = list_response.json()
    assert len(incidents) > 0
    assert any(inc["id"] == incident_id for inc in incidents)

def test_navigation_endpoint():
    """Test the routing engine with starting and ending locations."""
    payload = {
        "start_location": "Gate A",
        "destination": "Section 101",
        "wheelchair": True,
        "visual": False,
        "stroller": False
    }
    response = client.post("/api/navigation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "route_description" in data
    assert "estimated_time_minutes" in data
    assert isinstance(data["key_locations_passed"], list)

def test_alerts_endpoint():
    """Test retrieving active alerts from the dashboard bulletin feed."""
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)
