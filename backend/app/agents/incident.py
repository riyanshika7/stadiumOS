import json
import logging
from google import genai
from google.genai import types
from backend.app.config import GEMINI_API_KEY, USE_SIMULATOR

logger = logging.getLogger(__name__)

# System instructions and schema
SYSTEM_INSTRUCTION = """
You are the Incident Parser Agent for StadiumOS.
Your job is to read a raw message submitted by a volunteer in the stadium and extract structured details about the incident.

Categorize and extract:
1. Incident Category: Must be one of "medical", "security", "hazard" (e.g. spill, broken seat), "lost_found", or "general".
2. Urgency: Must be "low", "medium", or "high". (High is reserved for active injuries, security threats, or blocked main exits).
3. Location: Extract any mentioned gate, section, seat row, or concession stand. If not mentioned, set to "unknown".
4. Description: A clean, concise summary of the issue.
5. Required Action: What immediate step should be taken.

You MUST return a JSON object matching this schema:
{
  "category": "string (medical / security / hazard / lost_found / general)",
  "urgency": "string (low / medium / high)",
  "location": "string",
  "description": "string",
  "required_action": "string"
}
"""

def parse_incident_genai(raw_text: str) -> dict:
    """Invokes Gemini to parse and structure the raw incident text."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=f"Extract and structure this incident report: '{raw_text}'",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.1
        )
    )
    
    result = json.loads(response.text.strip())
    return result

def parse_incident_simulator(raw_text: str) -> dict:
    """Rule-based local fallback parser for offline testing or missing API keys."""
    text_lower = raw_text.lower()
    
    category = "general"
    urgency = "low"
    location = "unknown"
    action = "Assess situation and contact section supervisor."
    
    # Simple location extractor
    for word in ["gate a", "gate b", "gate c", "gate d", "section 101", "section 102", "section 204", "restroom block a", "concession stand north"]:
        if word in text_lower:
            location = word.title()
            break
            
    # Medical classification
    if any(w in text_lower for w in ["faint", "heart", "breathe", "chest", "collapse", "hurt", "injured", "pain", "medical", "bleeding"]):
        category = "medical"
        urgency = "high"
        action = "Dispatch emergency medical team with stretcher."
    
    # Security classification
    elif any(w in text_lower for w in ["fight", "steal", "theft", "weapon", "assault", "threat", "harass", "security"]):
        category = "security"
        urgency = "high"
        action = "Alert stadium security dispatch and supervisors."
        
    # Hazard classification
    elif any(w in text_lower for w in ["spill", "wet", "slippery", "leak", "broken", "seat", "wire", "hazard", "trash"]):
        category = "hazard"
        urgency = "medium" if "broken" in text_lower or "leak" in text_lower else "low"
        action = "Notify cleaning crew and facilities team to inspect."
        
    # Lost & Found classification
    elif any(w in text_lower for w in ["lost", "found", "wallet", "phone", "bag", "backpack", "keys", "camera"]):
        category = "lost_found"
        urgency = "low"
        action = "Log in Lost & Found database and hand over to Info Desk."

    return {
        "category": category,
        "urgency": urgency,
        "location": location,
        "description": raw_text,
        "required_action": action
    }

def handle_incident_parsing(raw_text: str) -> dict:
    """Core entrypoint for incident parsing with simulator fallback."""
    if USE_SIMULATOR:
        logger.info("Using Local Incident Parser (No API Key)")
        return parse_incident_simulator(raw_text)
        
    try:
        return parse_incident_genai(raw_text)
    except Exception as e:
        logger.error(f"GenAI Incident Parsing failed, falling back to simulator: {e}")
        return parse_incident_simulator(raw_text)
