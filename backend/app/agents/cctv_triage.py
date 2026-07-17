import json
import logging
import base64
from google import genai
from google.genai import types
from backend.app.config import GEMINI_API_KEY, USE_SIMULATOR

logger = logging.getLogger(__name__)

# System instructions for CCTV Video Triage Agent
SYSTEM_INSTRUCTION = """
You are the Senior CCTV Multimodal Video Surveillance & Crowd Dynamics Triage Agent for the FIFA World Cup 2026.
Your task is to analyze video frames or images from stadium security cameras to detect operational hazards, crowd surges, or medical collapses.

You MUST produce a JSON response detailing:
1. "risk_index": Risk level from 1 (completely calm) to 10 (critical emergency, crush or panic detected).
2. "anomaly_detected": Description of visual anomalies (e.g., fans running, climbing fences, bottleneck buildup, collapsed fan).
3. "predicted_impact": The operational consequence in the next 5 minutes if no intervention is made.
4. "automated_dispatch_action": Exact instructions pushed to nearby volunteers' terminals immediately.

You MUST return a JSON object matching this schema:
{
  "risk_index": 5,
  "anomaly_detected": "string",
  "predicted_impact": "string",
  "automated_dispatch_action": "string"
}

Do not include markdown code block characters like ```json, return ONLY the raw JSON text.
"""

def analyze_cctv_genai(image_b64: str) -> dict:
    """Invokes Gemini Multimodal Vision API to parse CCTV security frames."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    # Clean base64 header if present
    if "," in image_b64:
        image_b64 = image_b64.split(",")[1]
        
    image_data = base64.b64decode(image_b64)
    
    response = client.models.generate_content(
        model='gemini-3.1-pro',
        contents=[
            types.Part.from_bytes(
                data=image_data,
                mime_type='image/jpeg'
            ),
            "Analyze these CCTV security camera frames and output the structured crowd safety JSON analysis."
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.1
        )
    )
    
    result = json.loads(response.text.strip())
    return result

def analyze_cctv_simulator(scenario: str) -> dict:
    """Local fallback simulator for CCTV surveillance analysis."""
    if scenario == "surge":
        return {
            "risk_index": 9,
            "anomaly_detected": "Critical crowd surge at Gate C. Fans are bottlenecking, climbing barrier fences, and pushing forward.",
            "predicted_impact": "Severe gate crush or crowd collapse at Gate C access ramp within 3 minutes.",
            "automated_dispatch_action": "CRITICAL BROADCAST: All standby concourse volunteers proceed to Gate C immediately. Form crowd wedges to split incoming flow. Divert incoming fans to Gate D."
        }
    elif scenario == "medical":
        return {
            "risk_index": 8,
            "anomaly_detected": "A fan has collapsed on the floor in Section 104 corridor. A small crowd is gathering around, causing a corridor bottleneck.",
            "predicted_impact": "Medical responder transit delay due to corridor blockages.",
            "automated_dispatch_action": "ALERT: Volunteers in Sector 104 proceed to Section 104 corridor. Form a pedestrian barrier to clear the path for the incoming medical buggy."
        }
    else:
        return {
            "risk_index": 2,
            "anomaly_detected": "Normal fan ingress. Fans are walking in orderly lines through security scanners.",
            "predicted_impact": "None. Smooth operations.",
            "automated_dispatch_action": "No immediate dispatch required. Maintain standard perimeter patrol."
        }

def handle_cctv_analysis(image_b64: str, scenario: str = "normal") -> dict:
    """Core entrypoint for CCTV crowd surveillance with simulator fallback."""
    if USE_SIMULATOR or not image_b64:
        logger.info(f"Using Local CCTV Vision Simulator for scenario: {scenario}")
        return analyze_cctv_simulator(scenario)
        
    try:
        return analyze_cctv_genai(image_b64)
    except Exception as e:
        logger.error(f"GenAI CCTV Analysis failed: {e}")
        return analyze_cctv_simulator(scenario)
