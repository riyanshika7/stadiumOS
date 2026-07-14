import json
import logging
from google import genai
from google.genai import types
from backend.app.config import GEMINI_API_KEY, USE_SIMULATOR

logger = logging.getLogger(__name__)

# System instructions for the Explainable AI (XAI) Crowd Agent
SYSTEM_INSTRUCTION = """
You are the Senior Crowd Operations Architect for the FIFA World Cup 2026.
Your job is to provide Explainable AI (XAI) recommendations to stadium volunteers when a specific gate or zone crosses an 80% capacity threshold.

You will receive the following parameters:
- Zone Name
- Total Capacity
- Current Fan Count
- Current Density (Percentage)
- Available Nearby Alternative Zones

Your output MUST be a JSON object explaining:
1. The Reason: A clear, plain-English explanation of why this alert is triggered and its impact.
2. The Action: Specific instructions for the volunteer on the ground (e.g., directing traffic to a specific alternative gate).

You MUST return a JSON object matching this schema:
{
  "explanation": "string (plain English explanation of the bottleneck and safety concern)",
  "recommended_action": "string (clear, actionable instruction for volunteers on redirecting fans)"
}

Guidelines:
- Keep the tone authoritative, helpful, and clear.
- Explain the physical bottleneck (e.g. why 90% at a stairs-gate is more critical than a ramp-gate).
- Return ONLY raw JSON text.
"""

def generate_crowd_recommendation_genai(zone_name: str, capacity: int, count: int, density: float, alternatives: list) -> dict:
    """Invokes Gemini to create a reasoning-based crowd control alert and recommendation."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = f"""
    Zone: {zone_name}
    Capacity: {capacity}
    Current Count: {count}
    Current Density: {density * 100:.1f}%
    Available Alternatives: {", ".join(alternatives)}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.2
        )
    )
    
    result = json.loads(response.text.strip())
    return result

def generate_crowd_recommendation_simulator(zone_name: str, capacity: int, count: int, density: float, alternatives: list) -> dict:
    """Local fallback engine for Explainable AI (XAI) recommendations."""
    density_pct = density * 100
    alt_str = alternatives[0] if alternatives else "nearby open exits"
    
    explanation = (
        f"Zone {zone_name} has crossed the critical safety threshold, operating at {density_pct:.1f}% capacity "
        f"({count} fans out of {capacity} maximum capacity). This creates a localized congestion bottleneck that "
        f"restricts passenger throughput and poses a stampede or blockage risk at exits."
    )
    
    recommended_action = (
        f"Direct incoming fans away from {zone_name}. Request Spanish/English speaking volunteers to stand at "
        f"the intersections and redirect foot traffic to {alt_str} which has lower congestion."
    )
    
    return {
        "explanation": explanation,
        "recommended_action": recommended_action
    }

def handle_crowd_recommendation(zone_name: str, capacity: int, count: int, alternatives: list) -> dict:
    """Core entrypoint that manages the crowd recommendation pipeline."""
    density = count / capacity if capacity > 0 else 0.0
    
    if USE_SIMULATOR:
        logger.info("Using Local Crowd Advisor Simulator (No API Key)")
        return generate_crowd_recommendation_simulator(zone_name, capacity, count, density, alternatives)
        
    try:
        return generate_crowd_recommendation_genai(zone_name, capacity, count, density, alternatives)
    except Exception as e:
        logger.error(f"GenAI Crowd Recommendation failed, falling back to simulator: {e}")
        return generate_crowd_recommendation_simulator(zone_name, capacity, count, density, alternatives)
