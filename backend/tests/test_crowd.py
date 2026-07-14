import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.utils import binary_search_locations
from backend.app.agents.crowd_control import handle_crowd_recommendation

# Simple mock class for testing binary search
class MockLocation:
    def __init__(self, name):
        self.name = name

def test_binary_search_algorithm():
    """Verify O(log n) binary search sorts and retrieves elements correctly."""
    locations = [
        MockLocation("Gate A"),
        MockLocation("Section 101"),
        MockLocation("Gate C"),
        MockLocation("Restroom Block A"),
        MockLocation("Gate B")
    ]
    
    # Target search matches
    match = binary_search_locations(locations, "Gate B")
    assert match is not None
    assert match.name == "Gate B"
    
    # Check case-insensitivity
    match_lower = binary_search_locations(locations, "section 101")
    assert match_lower is not None
    assert match_lower.name == "Section 101"
    
    # Missing entry returns None
    missing = binary_search_locations(locations, "Gate X")
    assert missing is None

def test_xai_crowd_agent_logic():
    """Verify Explainable AI (XAI) generates structured reasoning and action instructions."""
    res = handle_crowd_recommendation(
        zone_name="Gate C",
        capacity=1000,
        count=850, # 85% density
        alternatives=["Gate D", "Gate A"]
    )
    assert "explanation" in res
    assert "recommended_action" in res
    assert "Gate C" in res["explanation"]
    assert "Gate D" in res["recommended_action"] or "Gate A" in res["recommended_action"] or "redirect" in res["recommended_action"].lower()

def test_csv_upload_endpoint():
    """Test the POST /api/crowd/upload-csv endpoint with mock CSV data."""
    client = TestClient(app)
    
    # Synthetic CSV representing zone densities
    csv_data = (
        "zone_name,capacity,current_count\n"
        "Gate A,1000,300\n"        # 30% - normal
        "Gate B,1000,850\n"        # 85% - bottleneck trigger XAI
        "Section 101,500,100\n"    # 20% - normal
        "Section 204,600,550\n"    # 91% - bottleneck trigger XAI
    )
    
    # Create multipart file upload payload
    files = {
        "file": ("stadium_test.csv", csv_data, "text/csv")
    }
    
    response = client.post("/api/crowd/upload-csv", files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "success"
    # We seeded Gate B, Section 101, Section 204. Gate A is also seeded.
    # Total processed nodes should be 4.
    assert data["processed_zones_count"] == 4
    # Both Gate B (85% > 80%) and Section 204 (91% > 80%) should trigger XAI alerts.
    assert data["critical_alerts_triggered"] == 2
    
    # Check that live alerts feed contains the generated bulletins
    alerts_response = client.get("/api/alerts")
    assert alerts_response.status_code == 200
    alerts = alerts_response.json()
    assert len(alerts) >= 2
    # Check that the critical alert has been logged
    assert any("Capacity Bottleneck" in al["title"] for al in alerts)
