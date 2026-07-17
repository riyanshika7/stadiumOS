import pytest
from unittest.mock import MagicMock, patch
import base64
import hashlib
import io
import os
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db import SessionLocal
from backend.app.agents.swarm import coordinate_swarm_simulator, handle_swarm_coordination
from backend.app.agents.translator import translate_query_simulator, handle_translation
from backend.app.agents.vision_gate import handle_ticket_vision, _is_non_ticket_by_filename
from backend.app.agents.navigation import dijkstra_path

def test_swarm_simulator_coverage():
    # 1. Tier 1: Critical
    res = coordinate_swarm_simulator("suffocation at section 101")
    assert "🚨 CRITICAL" in res["coordination_summary"]

    # 2. Tier 2: High
    res = coordinate_swarm_simulator("fainted in sector 102")
    assert "🔴 HIGH" in res["coordination_summary"]

    # 3. Tier 3: Medium / Medical
    res = coordinate_swarm_simulator("heat exhaustion at gate A")
    assert "🟡 Medical" in res["coordination_summary"]

    # 4. Preset spanish
    res = coordinate_swarm_simulator("spanish query on gate c")
    assert "Gate C" in res["coordination_summary"]

    # 5. Preset lost child
    res = coordinate_swarm_simulator("lost child on wet ramp")
    assert "West Info Booth" in res["coordination_summary"]

    # 6. Default
    res = coordinate_swarm_simulator("normal fan entry query")
    assert "Situation assessed" in res["coordination_summary"]

    # 7. handle_swarm_coordination simulator fallback
    with patch("backend.app.agents.swarm.USE_SIMULATOR", True):
        res = handle_swarm_coordination("fainted")
        assert "🔴 HIGH" in res["coordination_summary"]


def test_translator_simulator_coverage():
    # 1. Thai toilet & general
    res = translate_query_simulator("ห้องน้ำอยู่ที่ไหน")
    assert res["intent_detection"]["detected_language"] == "Thai"
    res = translate_query_simulator("สวัสดี")
    assert res["intent_detection"]["detected_language"] == "Thai"

    # 2. Chinese restroom, emergency & general
    res = translate_query_simulator("洗手间")
    assert res["intent_detection"]["detected_language"] == "Mandarin Chinese"
    res = translate_query_simulator("救命")
    assert res["intent_detection"]["detected_language"] == "Mandarin Chinese"
    res = translate_query_simulator("你好")
    assert res["intent_detection"]["detected_language"] == "Mandarin Chinese"

    # 3. French restroom & ticketing
    res = translate_query_simulator("toilette s'il vous plaît")
    assert res["intent_detection"]["detected_language"] == "French"
    res = translate_query_simulator("escalier")
    assert res["intent_detection"]["detected_language"] == "French"

    # 4. Arabic emergency & general
    res = translate_query_simulator("مستشفى")
    assert res["intent_detection"]["detected_language"] == "Arabic"
    res = translate_query_simulator("شكرا")
    assert res["intent_detection"]["detected_language"] == "Arabic"

    # 5. German restroom & general (using WC + hilfe to bypass French check)
    res = translate_query_simulator("Wo ist das WC?")
    assert res["intent_detection"]["detected_language"] == "German"
    res = translate_query_simulator("hilfe bitte")
    assert res["intent_detection"]["detected_language"] == "German"

    # 6. Portuguese restroom & general
    res = translate_query_simulator("banheiro")
    assert res["intent_detection"]["detected_language"] == "Portuguese"
    res = translate_query_simulator("elevador")
    assert res["intent_detection"]["detected_language"] == "Portuguese"

    # 7. Italian restroom & general
    res = translate_query_simulator("bagno")
    assert res["intent_detection"]["detected_language"] == "Italian"
    res = translate_query_simulator("dottore")
    assert res["intent_detection"]["detected_language"] == "Italian"

    # 8. English/Default emergency, frustrated & calm — now via XAI schema
    res = translate_query_simulator("doctor please help")
    assert res["intent_detection"]["tone"] == "panicked"
    res = translate_query_simulator("stole my ticket")
    assert res["intent_detection"]["tone"] == "angry"

    # 9. handle_translation simulator fallback — check XAI structure present
    with patch("backend.app.agents.translator.USE_SIMULATOR", True):
        res = handle_translation("hello")
        assert res["intent_detection"]["detected_language"] == "English (or Unknown)"



def test_vision_gate_file_checks():
    # 1. Non-ticket filename check
    assert _is_non_ticket_by_filename("") is False
    assert _is_non_ticket_by_filename("beach_photo.jpg") is True

    # 2. handle_ticket_vision types
    # fifa_actual
    res = handle_ticket_vision("mock_b64", "fifa_actual")
    assert res["is_valid"] is True

    # custom upload (MD5 exact match)
    dummy_bytes = b"dummy_content"
    dummy_hash = hashlib.md5(dummy_bytes).hexdigest()
    dummy_b64 = base64.b64encode(dummy_bytes).decode("utf-8")

    with patch("os.path.exists", return_value=True), \
         patch("builtins.open", MagicMock(return_value=MagicMock(__enter__=MagicMock(return_value=MagicMock(read=MagicMock(return_value=dummy_bytes)))))):
        res = handle_ticket_vision(dummy_b64, "custom")
        assert res["is_valid"] is True

    # custom upload (fallback file size match)
    size_bytes = b"x" * 13849
    size_b64 = base64.b64encode(size_bytes).decode("utf-8")
    with patch("os.path.exists", return_value=False):
        res = handle_ticket_vision(size_b64, "custom")
        assert res["is_valid"] is True

    # invalid scenario
    res = handle_ticket_vision(dummy_b64, "custom")
    assert res["is_valid"] is False


def test_main_endpoints_extended():
    with TestClient(app) as client:
        # Test GET /api/locations
        response = client.get("/api/locations")
        assert response.status_code == 200

        # Test POST /api/crowd/upload-db success & failure
        with patch("shutil.move"), patch("builtins.open", MagicMock()):
            response = client.post(
                "/api/crowd/upload-db",
                files={"file": ("test.db", b"SQLite format 3\x00data", "application/octet-stream")}
            )
            assert response.status_code == 200

        response = client.post(
            "/api/crowd/upload-db",
            files={"file": ("test.jpg", b"invalid header", "application/octet-stream")}
        )
        assert response.status_code == 400

        # Test database size limit uploader check
        response = client.post(
            "/api/crowd/upload-db",
            files={"file": ("test.db", b"SQLite format 3" + (b"x" * 9 * 1024 * 1024), "application/octet-stream")}
        )
        assert response.status_code == 400

        # Test GET /api/incidents
        response = client.get("/api/incidents")
        assert response.status_code == 200

        # Test POST /api/incident with high urgency (triggering warning alerts creation)
        response = client.post(
            "/api/incident",
            json={"category": "medical", "location": "Gate A", "description": "Collapsed fan", "urgency": "high"}
        )
        assert response.status_code == 200

        # Test PATCH /api/incidents/{incident_id} non-resolved update
        response = client.patch(
            "/api/incidents/1",
            json={"status": "open"}
        )
        assert response.status_code == 200 or response.status_code == 404

        # Test POST /api/alerts & POST /api/alerts/clear
        response = client.post(
            "/api/alerts",
            json={"title": "Test Alert", "message": "Broadcast Message", "type": "warning"}
        )
        assert response.status_code == 200

        response = client.post("/api/alerts/clear")
        assert response.status_code == 200

        # Test POST /api/crowd/upload-csv success
        csv_data = "zone_name,capacity,current_count\nGate A,1000,900\nInvalid Zone,10,5\nGate B,0,-10\n"
        response = client.post(
            "/api/crowd/upload-csv",
            files={"file": ("test.csv", csv_data.encode("utf-8"), "text/csv")}
        )
        assert response.status_code == 200

        # Test POST /api/crowd/upload-csv invalid encoding
        response = client.post(
            "/api/crowd/upload-csv",
            files={"file": ("test.csv", b"\xff\xfe\x00\x00", "text/csv")}
        )
        assert response.status_code == 400

        # Test POST /api/crowd/upload-csv limit safety check
        response = client.post(
            "/api/crowd/upload-csv",
            files={"file": ("test.csv", b"x" * 3 * 1024 * 1024, "text/csv")}
        )
        assert response.status_code == 400

        # Test POST /api/crowd/upload-pdf file extension check
        response = client.post(
            "/api/crowd/upload-pdf",
            files={"file": ("test.jpg", b"dummy", "image/jpeg")}
        )
        assert response.status_code == 400

        # Test POST /api/crowd/upload-pdf limit safety check
        response = client.post(
            "/api/crowd/upload-pdf",
            files={"file": ("test.pdf", b"x" * 6 * 1024 * 1024, "application/pdf")}
        )
        assert response.status_code == 400

        # Test POST /api/chaos/simulate with unknown scenario (hits line 552)
        response = client.post(
            "/api/chaos/simulate",
            json={"scenario": "unknown_scenario"}
        )
        assert response.status_code == 200
        assert response.json()["status"] == "gracefully_caught"


def test_gcp_firebase_sync():
    """Verifies the GCP FirebaseSyncService gracefully returns False when Firebase is not configured."""
    from backend.app.gcp import FirebaseSyncService
    # When Firebase credentials are absent the methods should return False gracefully
    result_incident = FirebaseSyncService.sync_incident(99, {"category": "test", "urgency": "low"})
    assert result_incident is False

    result_alert = FirebaseSyncService.sync_alert(99, {"title": "test", "type": "info"})
    assert result_alert is False
