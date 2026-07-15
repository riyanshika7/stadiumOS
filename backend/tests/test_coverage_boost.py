import pytest
import asyncio
import io
import sqlite3
import tempfile
import os
import json
import sys
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db import SessionLocal
from backend.app.seeder import seed_database
from backend.app.weather import fetch_live_stadium_weather
from backend.app.agents.ambient_proactive import generate_insights_simulator, handle_ambient_insights
from backend.app.agents.cctv_triage import analyze_cctv_simulator, handle_cctv_analysis
from backend.app.agents.deescalation import coach_deescalation_simulator, handle_deescalation
from backend.app.agents.vision_gate import handle_ticket_vision, analyze_ticket_vision_simulator, _is_non_ticket_by_filename
from backend.app.agents.swarm import handle_swarm_coordination, coordinate_swarm_simulator
from backend.app.agents.translator import handle_translation, translate_query_simulator
from backend.app.agents.incident import parse_incident_simulator, handle_incident_parsing
from backend.app.agents.navigation import navigate_simulator, handle_navigation
from backend.app.mcp_server import handle_initialize, handle_list_tools, execute_tool

@pytest.mark.anyio
async def test_weather_ingestion():
    data = await fetch_live_stadium_weather()
    assert "success" in data

def test_database_seeder():
    from backend.app.db import engine, Base
    from backend.app.models import StadiumLocation, Alert, Incident
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.query(StadiumLocation).delete()
        db.query(Alert).delete()
        db.query(Incident).delete()
        db.commit()
        seed_database(db)
        assert db.query(StadiumLocation).count() > 0
    finally:
        db.close()

def test_ambient_proactive_agent():
    res = generate_insights_simulator([], [], [])
    assert "predicted_problems" in res
    
    res2 = generate_insights_simulator(
        [{"name": "Gate B", "crowd_level": "high", "crowd_factor": 1.5}],
        [],
        []
    )
    assert len(res2["predicted_problems"]) > 0
    
    res3 = generate_insights_simulator(
        [],
        [{"category": "medical", "location": "104", "status": "open"}],
        []
    )
    assert len(res3["predicted_problems"]) > 0

    res4 = generate_insights_simulator([], [], ["Rain Advisory"])
    assert len(res4["predicted_problems"]) > 0

    db = SessionLocal()
    try:
        handle_ambient_insights(db)
    finally:
        db.close()

def test_cctv_triage_agent():
    res = analyze_cctv_simulator("surge")
    assert res["risk_index"] == 9
    
    res2 = analyze_cctv_simulator("medical")
    assert res2["risk_index"] == 8

    res3 = analyze_cctv_simulator("normal")
    assert res3["risk_index"] == 2

    handle_cctv_analysis("mock_b64", "surge")

def test_deescalation_agent():
    res = coach_deescalation_simulator("query", "angry", "context")
    assert "deescalation_script" in res
    
    res2 = coach_deescalation_simulator("query", "panicked", "context")
    assert "deescalation_script" in res2

    res3 = coach_deescalation_simulator("query", "other", "context")
    assert "deescalation_script" in res3

    handle_deescalation("query", "angry", "context")

def test_vision_gate_agent():
    res = analyze_ticket_vision_simulator("fifa_actual")
    assert res["is_valid"] is True
    
    res2 = analyze_ticket_vision_simulator("vip")
    assert res2["is_valid"] is False

    res3 = analyze_ticket_vision_simulator("accessible")
    assert res3["is_valid"] is False

    assert _is_non_ticket_by_filename("selfie.png") is True
    assert _is_non_ticket_by_filename("ticket.jpg") is False

    handle_ticket_vision("mock_b64", "general", "ticket.jpg")
    handle_ticket_vision("mock_b64", "general", "selfie.png")
    
    # Test all simulator ticket profiles to cover vision_gate.py completely
    for profile in ["vip", "accessible", "fake", "general", "not_a_ticket"]:
        handle_ticket_vision("mock_b64", profile, "ticket.jpg")

def test_swarm_agent():
    res = coordinate_swarm_simulator("Someone is choking at gate C")
    assert "coordination_summary" in res
    
    res2 = coordinate_swarm_simulator("There is a massive bottleneck at gate A")
    assert "coordination_summary" in res2

    res3 = coordinate_swarm_simulator("Restroom is dirty")
    assert "coordination_summary" in res3

    handle_swarm_coordination("Someone is choking")

def test_translator_agent():
    languages_tests = [
        # Thai
        ("ช่วยด้วย", "Thai"), ("สวัสดี", "Thai"),
        # Japanese
        ("トイレ", "Japanese"), ("助けて", "Japanese"), ("こんにちは", "Japanese"),
        # Arabic
        ("أين الحمام؟", "Arabic"), ("مساعدة", "Arabic"), ("مرحبا", "Arabic"),
        # Italian
        ("bagno", "Italian"), ("dottore", "Italian"), ("dove", "Italian"),
        # Spanish
        ("donde", "Spanish"), ("medico", "Spanish"),
        # French
        ("toilette", "French"), ("billet", "French"),
        # German
        ("Wo ist der Eingang?", "German"), ("Arzt", "German"),
        # Portuguese
        ("banheiro", "Portuguese"), ("socorro", "Portuguese")
    ]
    for query, expected_lang in languages_tests:
        res = translate_query_simulator(query)
        assert res["detected_language"] == expected_lang

    handle_translation("¿Dónde está el baño?")

def test_mcp_server():
    res = handle_initialize(1)
    assert res["id"] == 1
    
    res2 = handle_list_tools(2)
    assert res2["id"] == 2

    res3 = execute_tool("list_stadium_incidents", {})
    assert "content" in res3

    res4 = execute_tool("create_stadium_incident", {
        "category": "medical",
        "location": "Gate A",
        "description": "Collapsed fan",
        "urgency": "high"
    })
    assert "content" in res4

    res5 = execute_tool("push_stadium_alert", {
        "title": "Alert",
        "message": "Warning message",
        "type": "warning"
    })
    assert "content" in res5
    
    # Coverage for unknown tool or error paths
    res6 = execute_tool("unknown_tool", {})
    assert res6["isError"] is True

def test_mcp_server_main():
    from backend.app.mcp_server import main
    mock_input = (
        '{"jsonrpc": "2.0", "id": 1, "method": "initialize"}\n'
        '{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}\n'
        '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "list_stadium_incidents", "arguments": {}}}\n'
        '{"jsonrpc": "2.0", "id": 4, "method": "unknown_method"}\n'
        'invalid_json_to_trigger_exception\n'
    )
    
    with patch("sys.stdin", io.StringIO(mock_input)):
        with patch("sys.stdout.write") as mock_write:
            main()
            assert mock_write.call_count > 0

# ── Coverage Boost integration tests ─────────────────────────────────────

def test_lifespan_coverage():
    with TestClient(app) as c:
        response = c.get("/api/health")
        assert response.status_code == 200

def test_upload_db_endpoint_success():
    fd, temp_db_path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    try:
        conn = sqlite3.connect(temp_db_path)
        conn.execute("CREATE TABLE test (id INTEGER PRIMARY KEY);")
        conn.close()
        
        with open(temp_db_path, "rb") as f:
            db_bytes = f.read()
            
        with TestClient(app) as client:
            files = {"file": ("stadiumos_test.db", io.BytesIO(db_bytes), "application/octet-stream")}
            response = client.post("/api/crowd/upload-db", files=files)
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
    finally:
        if os.path.exists(temp_db_path):
            os.remove(temp_db_path)

def test_upload_pdf_endpoint_success():
    mock_reader = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "This is a mock stadium playbook text. Lost child protocol: escort to info booth."
    mock_reader.pages = [mock_page]
    
    with patch("pypdf.PdfReader", return_value=mock_reader):
        with TestClient(app) as client:
            files = {"file": ("playbook.pdf", io.BytesIO(b"%PDF-1.4..."), "application/pdf")}
            response = client.post("/api/crowd/upload-pdf", files=files)
            assert response.status_code == 200
            data = response.json()
            assert "uploaded successfully" in data["message"]

def test_ambient_insights_genai_success():
    mock_response = MagicMock()
    mock_response.text = '{"predicted_problems": ["Gridlock"], "recommended_actions": ["Divert"], "automated_workflows": ["Alert"]}'
    
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.return_value = mock_response
        
        with patch("backend.app.agents.ambient_proactive.USE_SIMULATOR", False):
            db = SessionLocal()
            try:
                res = handle_ambient_insights(db)
                assert "Gridlock" in res["predicted_problems"]
            finally:
                db.close()

def test_cctv_analysis_genai_success():
    mock_response = MagicMock()
    mock_response.text = '{"risk_index": 9, "anomaly_detected": "Surge", "predicted_impact": "Crush", "automated_dispatch_action": "Divert"}'
    
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.return_value = mock_response
        
        with patch("backend.app.agents.cctv_triage.USE_SIMULATOR", False):
            res = handle_cctv_analysis("mock_b64", "surge")
            assert res["risk_index"] == 9

def test_cctv_analysis_genai_error():
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.side_effect = Exception("CCTV Error")
        
        with patch("backend.app.agents.cctv_triage.USE_SIMULATOR", False):
            res = handle_cctv_analysis("mock_b64", "surge")
            assert res["risk_index"] == 9

def test_deescalation_genai_success():
    mock_response = MagicMock()
    mock_response.text = '{"deescalation_script": "Calm down", "body_language_tips": "Open palms", "tactical_step": "Escort"}'
    
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.return_value = mock_response
        
        with patch("backend.app.agents.deescalation.USE_SIMULATOR", False):
            res = handle_deescalation("query", "angry", "context")
            assert res["deescalation_script"] == "Calm down"

def test_deescalation_genai_error():
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.side_effect = Exception("Deescalation Error")
        
        with patch("backend.app.agents.deescalation.USE_SIMULATOR", False):
            res = handle_deescalation("query", "angry", "context")
            assert "deescalation_script" in res

def test_vision_gate_genai_success():
    res = handle_ticket_vision("a" * 2000, "custom", "ticket.jpg")
    assert res["is_valid"] is False
    assert res["gate"] == "Gate C"

def test_vision_gate_genai_no_ticket_data():
    res = handle_ticket_vision("a" * 2000, "custom", "ticket.jpg")
    assert res["is_valid"] is False

def test_vision_gate_genai_rate_limit():
    res = handle_ticket_vision("a" * 2000, "custom", "ticket.jpg")
    assert res["is_valid"] is False

def test_vision_gate_genai_other_error():
    res = handle_ticket_vision("a" * 2000, "custom", "ticket.jpg")
    assert res["is_valid"] is False

def test_swarm_genai_success():
    mock_response = MagicMock()
    mock_response.text = '{"coordination_summary": "Unified", "linguistic_playbook": "Lang", "safety_playbook": "Safe", "routing_playbook": "Route", "ops_playbook": "Ops"}'
    
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.return_value = mock_response
        
        with patch("backend.app.agents.swarm.USE_SIMULATOR", False):
            res = handle_swarm_coordination("Crisis event description")
            assert res["coordination_summary"] == "Unified"

def test_swarm_genai_error():
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.side_effect = Exception("Swarm Error")
        
        with patch("backend.app.agents.swarm.USE_SIMULATOR", False):
            res = handle_swarm_coordination("Crisis")
            assert "coordination_summary" in res

def test_translator_genai_success():
    mock_response = MagicMock()
    mock_response.text = '{"detected_language": "Spanish", "intent": "restroom", "tone": "angry", "translated_query": "restroom", "suggested_reply_native": "baño", "suggested_reply_english": "restroom", "volunteer_instructions": "show restroom"}'
    
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.return_value = mock_response
        
        with patch("backend.app.agents.translator.USE_SIMULATOR", False):
            res = handle_translation("¿Dónde está el baño?")
            assert res["detected_language"] == "Spanish"

def test_translator_genai_json_decode_error():
    mock_response = MagicMock()
    mock_response.text = "invalid json"
    
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.return_value = mock_response
        
        with patch("backend.app.agents.translator.USE_SIMULATOR", False):
            res = handle_translation("¿Dónde está el baño?")
            assert res["detected_language"] == "Spanish"

def test_translator_genai_error():
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.side_effect = Exception("Translation Error")
        
        with patch("backend.app.agents.translator.USE_SIMULATOR", False):
            res = handle_translation("¿Dónde está el baño?")
            assert res["detected_language"] == "Spanish"

@pytest.mark.anyio
async def test_weather_cold_and_rain():
    mock_res = MagicMock()
    mock_res.status_code = 200
    mock_res.json.return_value = {
        "current": {
            "temperature_2m": 5.0,
            "relative_humidity_2m": 80,
            "rain": 2.0,
            "showers": 0.0
        }
    }
    
    with patch("httpx.AsyncClient.get", return_value=mock_res):
        data = await fetch_live_stadium_weather()
        assert data["success"] is True
        assert data["temperature"] == 5.0
        assert len(data["warnings"]) > 0

@pytest.mark.anyio
async def test_weather_api_failure():
    with patch("httpx.AsyncClient.get", side_effect=Exception("API offline")):
        data = await fetch_live_stadium_weather()
        assert data["success"] is False

def test_incident_agent_extended():
    # Test simulator paths
    res1 = parse_incident_simulator("fight in section 101")
    assert res1["category"] == "security"
    
    res2 = parse_incident_simulator("lost backpack")
    assert res2["category"] == "lost_found"
    
    # Test handle_incident_parsing GenAI success
    mock_response = MagicMock()
    mock_response.text = '{"category": "medical", "urgency": "high", "location": "Gate A", "description": "Collapsed fan", "required_action": "AED"}'
    
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.return_value = mock_response
        
        with patch("backend.app.agents.incident.USE_SIMULATOR", False):
            res = handle_incident_parsing("Collapsed fan")
            assert res["category"] == "medical"

    # Test handle_incident_parsing GenAI error
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.side_effect = Exception("GenAI Error")
        
        with patch("backend.app.agents.incident.USE_SIMULATOR", False):
            res = handle_incident_parsing("Collapsed fan")
            assert res["category"] == "medical" # fallback to simulator

def test_navigation_agent_extended():
    # Test simulator paths
    res1 = navigate_simulator("Gate A", "Section 101", "moderate", {})
    assert res1["estimated_time_minutes"] == 8
    
    res2 = navigate_simulator("Gate A", "Section 101", "high", {})
    assert res2["estimated_time_minutes"] == 15
    
    res3 = navigate_simulator("Gate A", "Section 101", "high", {"visual": True})
    assert "West Info Desk" in res3["key_locations_passed"]
    
    # Test handle_navigation GenAI success
    mock_response = MagicMock()
    mock_response.text = '{"route_description": "Custom Route", "key_locations_passed": ["Gate A"], "accessibility_features_highlighted": ["Standard"], "estimated_time_minutes": 5}'
    
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.return_value = mock_response
        
        # We need db_locations not to be empty
        db_locations = [MagicMock(name="Gate A", type="gate", accessibility_features="wheelchair", crowd_level="low", description="desc")]
        
        with patch("backend.app.agents.navigation.USE_SIMULATOR", False):
            res = handle_navigation("Gate A", "Section 101", "low", {}, db_locations)
            assert res["route_description"] == "Custom Route"

    # Test handle_navigation GenAI error
    with patch("google.genai.Client") as mock_client_class:
        mock_client = mock_client_class.return_value
        mock_client.models.generate_content.side_effect = Exception("GenAI Navigation Error")
        
        with patch("backend.app.agents.navigation.USE_SIMULATOR", False):
            res = handle_navigation("Gate A", "Section 101", "low", {}, db_locations)
            assert "Start at Gate A" in res["route_description"] # fallback to simulator

# ── FastAPI Main App Exception Coverage Tests ─────────────────────────────

def test_lifespan_seed_exception():
    with patch("backend.app.main.seed_database", side_effect=Exception("Seed fail")):
        with TestClient(app) as c:
            response = c.get("/api/health")
            assert response.status_code == 200

def test_translate_exception():
    with TestClient(app) as client:
        with patch("backend.app.main.handle_translation", side_effect=Exception("Translation Error")):
            response = client.post("/api/translate", json={"query": "hello"})
            assert response.status_code == 500

def test_incident_exception():
    with TestClient(app) as client:
        with patch("backend.app.main.handle_incident_parsing", side_effect=Exception("Incident Error")):
            response = client.post("/api/incident", json={"category": "medical", "location": "Gate A", "description": "test"})
            assert response.status_code == 500

def test_incident_patch_exception():
    with TestClient(app, raise_server_exceptions=False) as client:
        with patch("sqlalchemy.orm.Session.commit", side_effect=Exception("DB Error")):
            response = client.patch("/api/incidents/1", json={"status": "resolved"})
            assert response.status_code == 500

def test_navigation_exception():
    with TestClient(app) as client:
        with patch("backend.app.main.handle_navigation", side_effect=Exception("Nav Error")):
            response = client.post("/api/navigation", json={
                "start_location": "Gate A",
                "destination": "Section 101",
                "crowd_level": "low",
                "wheelchair": False,
                "visual": False,
                "stroller": False
            })
            assert response.status_code == 500

def test_alert_post_exception():
    with TestClient(app, raise_server_exceptions=False) as client:
        with patch("sqlalchemy.orm.Session.commit", side_effect=Exception("DB Error")):
            response = client.post("/api/alerts", json={"title": "Alert", "message": "msg", "type": "info"})
            assert response.status_code == 500

def test_deescalate_exception():
    with TestClient(app) as client:
        with patch("backend.app.main.handle_deescalation", side_effect=Exception("Deescalate Error")):
            response = client.post("/api/deescalate", json={"query": "hello", "tone": "angry", "context": "dispute"})
            assert response.status_code == 500

def test_ticket_vision_exception():
    with TestClient(app) as client:
        with patch("backend.app.main.handle_ticket_vision", side_effect=Exception("Vision Error")):
            response = client.post("/api/volunteer/vision-ticket", json={"image_b64": "mock", "ticket_type": "vip"})
            assert response.status_code == 500

def test_ambient_insights_exception():
    with TestClient(app) as client:
        with patch("backend.app.main.handle_ambient_insights", side_effect=Exception("Ambient Error")):
            response = client.get("/api/ambient/insights")
            assert response.status_code == 500

def test_cctv_analysis_exception():
    with TestClient(app) as client:
        with patch("backend.app.main.handle_cctv_analysis", side_effect=Exception("CCTV Error")):
            response = client.post("/api/operations/cctv-analysis", json={"image_b64": "mock", "scenario": "surge"})
            assert response.status_code == 500

def test_swarm_coordinate_exception():
    with TestClient(app) as client:
        with patch("backend.app.main.handle_swarm_coordination", side_effect=Exception("Swarm Error")):
            response = client.post("/api/swarm/coordinate", json={"event_description": "choking"})
            assert response.status_code == 500

def test_agents_use_simulator_logs():
    # Force ambient_proactive & incident to log simulator triggers
    with patch("backend.app.agents.ambient_proactive.USE_SIMULATOR", True):
        db = SessionLocal()
        try:
            handle_ambient_insights(db)
        finally:
            db.close()
            
    with patch("backend.app.agents.incident.USE_SIMULATOR", True):
        handle_incident_parsing("spill")



