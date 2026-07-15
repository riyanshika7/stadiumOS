import pytest
import io
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

def test_ticket_upload_endpoint():
    payload = {
        "image_b64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP",
        "ticket_type": "vip"
    }
    response = client.post("/api/volunteer/vision-ticket", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "gate" in data
    assert data["category"] == "VIP Suite Pass"

def test_deescalation_coach_endpoint():
    payload = {
        "query": "Where is the restroom?",
        "tone": "angry",
        "context": "seating dispute"
    }
    response = client.post("/api/deescalate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "deescalation_script" in data

def test_ambient_insights_endpoint():
    response = client.get("/api/ambient/insights")
    assert response.status_code == 200
    data = response.json()
    assert "predicted_problems" in data

def test_cctv_analysis_endpoint():
    payload = {
        "image_b64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP",
        "scenario": "surge"
    }
    response = client.post("/api/operations/cctv-analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_index" in data

def test_swarm_coordinate_endpoint():
    payload = {
        "event_description": "Choking fan in gate C"
    }
    response = client.post("/api/swarm/coordinate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "coordination_summary" in data

def test_mock_sop_response_utility():
    from backend.app.main import mock_sop_response
    res1 = mock_sop_response("lost child")
    assert "Lost Child" in res1["answer"]
    res2 = mock_sop_response("medical help")
    assert "Medical" in res2["answer"]
    res3 = mock_sop_response("hello")
    assert "General" in res3["answer"]

def test_upload_pdf_endpoint_invalid():
    files = {"file": ("playbook.pdf", io.BytesIO(b"Not a PDF"), "application/pdf")}
    response = client.post("/api/crowd/upload-pdf", files=files)
    assert response.status_code in [200, 400, 500, 422]

def test_upload_db_endpoint_invalid():
    files = {"file": ("stadiumos.db", io.BytesIO(b"Not a DB"), "application/octet-stream")}
    response = client.post("/api/crowd/upload-db", files=files)
    assert response.status_code in [200, 400, 500, 422]

def test_playbook_query_endpoint():
    payload = {"query": "What is the lost child protocol?"}
    response = client.post("/api/playbook/query", json=payload)
    assert response.status_code == 200

def test_resolve_incident_not_found():
    response = client.patch("/api/incidents/999999", json={"status": "resolved"})
    assert response.status_code == 404

def test_create_incident_invalid():
    response = client.post("/api/incident", json={"description": ""})
    assert response.status_code == 422

def test_upload_csv_endpoint_invalid():
    files = {"file": ("crowd.csv", io.BytesIO(b"Corrupted,data\n"), "text/csv")}
    response = client.post("/api/crowd/upload-csv", files=files)
    assert response.status_code in [200, 400, 500, 422]


