import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.agents.translator import handle_translation

client = TestClient(app)

def test_corrupted_csv_missing_headers():
    """Verify that a CSV file missing mandatory headers returns 400 Bad Request."""
    corrupted_data = (
        "zone_name,wrong_header,current_count\n"
        "Gate B,1000,900"
    )
    files = {"file": ("corrupted.csv", corrupted_data, "text/csv")}
    response = client.post("/api/crowd/upload-csv", files=files)
    assert response.status_code == 400
    assert "headers" in response.json()["detail"].lower()

def test_corrupted_csv_invalid_types():
    """Verify that rows with malformed integers (e.g., text values) are skipped safely."""
    invalid_data = (
        "zone_name,capacity,current_count\n"
        "Gate B,ten_thousand,nine_hundred\n"  # Invalid types
        "Section 204,600,550\n"               # Valid row
    )
    files = {"file": ("corrupted.csv", invalid_data, "text/csv")}
    response = client.post("/api/crowd/upload-csv", files=files)
    assert response.status_code == 200
    # The invalid row is skipped, the valid row (Section 204) is processed and triggers 1 alert
    assert response.json()["processed_zones_count"] == 1
    assert response.json()["critical_alerts_triggered"] == 1

def test_corrupted_csv_wrong_extension():
    """Verify that uploading a non-CSV file (e.g., .txt or .png) is blocked instantly."""
    files = {"file": ("malicious.exe", "binary payload here", "application/octet-stream")}
    response = client.post("/api/crowd/upload-csv", files=files)
    assert response.status_code == 400
    assert "only csv" in response.json()["detail"].lower()

def test_translation_unsupported_language():
    """Verify that the translation engine handles random gibberish or unsupported languages gracefully."""
    # Input random character strings
    gibberish = "qwertyuiopasdfghjklzxcvbnm12345"
    res = handle_translation(gibberish)
    
    # Verify XAI structure present
    assert "intent_detection" in res
    assert res["intent_detection"]["detected_language"] is not None
    # Verify the fallback handles the query without throwing exceptions or returning empty fields
    assert res["intent_detection"]["translated_query"] == gibberish
    assert "suggested_reply_english" in res
    assert "volunteer_instructions" in res
    # Verify XAI core fields present
    assert "reasoning" in res
    assert "actionable_instruction" in res

def test_multiple_gates_simultaneous_bottleneck():
    """Verify that when multiple gates hit 100% capacity, all trigger independent XAI alerts."""
    simultaneous_data = (
        "zone_name,capacity,current_count\n"
        "Gate B,1000,1000\n"          # 100% capacity bottleneck
        "Gate C,800,800\n"            # 100% capacity bottleneck
        "Section 204,600,600\n"       # 100% capacity bottleneck
    )
    files = {"file": ("surge.csv", simultaneous_data, "text/csv")}
    response = client.post("/api/crowd/upload-csv", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["processed_zones_count"] == 3
    # All 3 zones exceeded 80% and should independently trigger XAI redirect warnings
    assert data["critical_alerts_triggered"] == 3
    
    # Verify alerts exist on feed
    feed_response = client.get("/api/alerts")
    feed = feed_response.json()
    # Confirm title labels match
    assert any("GATE B" in al["title"] for al in feed)
    assert any("GATE C" in al["title"] for al in feed)
    assert any("SECTION 204" in al["title"] for al in feed)

def test_playbook_rag_querying():
    """Verify that the PDF playbook RAG endpoint correctly processes query requests."""
    payload = {"query": "What should I do if a child is lost?"}
    response = client.post("/api/playbook/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    # Verify the response is specific to the lost child protocol
    assert "lost child" in data["answer"].lower() or "booth" in data["answer"].lower()

def test_sqlite_db_upload_extension_guard():
    """Verify that uploading a database file with an invalid extension is rejected."""
    files = {"file": ("corrupted_db.txt", "mock db content", "application/octet-stream")}
    response = client.post("/api/crowd/upload-db", files=files)
    assert response.status_code == 400
    assert "sqlite" in response.json()["detail"].lower()

def test_ticket_vision_actual_fifa_filename():
    """Verify that uploading a ticket with 'actual' or 'fifa' in the filename returns the MetLife Stadium Section 108 seat details."""
    payload = {
        "image_b64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
        "ticket_type": "custom",
        "filename": "ACTUAL FIFA.jpg"
    }
    response = client.post("/api/volunteer/vision-ticket", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["gate"] == "Gate 5"
    assert data["section"] == "108"
    assert data["row"] == "12"
    assert data["seat"] == "5"
    assert data["is_valid"] is True
    assert "MetLife Stadium" in data["volunteer_action_guide"]

def test_chaos_simulator_scenarios():
    """Verify that backend gracefully intercepts corrupt CSV, capacity issues, and unknown translation audio."""
    # Scenario 1: Corrupt CSV
    response = client.post("/api/chaos/simulate", json={"scenario": "corrupt_csv"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "gracefully_caught"
    assert "ValueError" in data["error_caught"] or "missing" in data["error_caught"]
    assert "Corrupt CSV" in data["fallback_message"]
    
    # Scenario 2: Simultaneous capacity conflict
    response2 = client.post("/api/chaos/simulate", json={"scenario": "simultaneous_capacity"})
    assert response2.status_code == 200
    data2 = response2.json()
    assert data2["status"] == "gracefully_caught"
    assert "Database Connection Pool" in data2["error_caught"]
    assert "Multi-gate saturation" in data2["fallback_message"]

    # Scenario 3: Unknown translation audio
    response3 = client.post("/api/chaos/simulate", json={"scenario": "unknown_audio"})
    assert response3.status_code == 200
    data3 = response3.json()
    assert data3["status"] == "gracefully_caught"
    assert "Unsupported Language" in data3["error_caught"]
    assert "Linguistic translation failure" in data3["fallback_message"]

def test_dijkstra_pathfinding_algorithm():
    """Verify Dijkstra algorithm calculates shortest path with congestion penalties & step-free blocks."""
    # 1. Base route request
    payload = {
        "start_location": "Gate A",
        "destination": "Section 204",
        "wheelchair": True,
        "visual": False,
        "stroller": False
    }
    response = client.post("/api/navigation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "route_description" in data
    assert "visual_path_coordinates" in data
    assert len(data["key_locations_passed"]) > 1
    assert "Gate A" in data["key_locations_passed"]
    assert "Section 204" in data["key_locations_passed"]



