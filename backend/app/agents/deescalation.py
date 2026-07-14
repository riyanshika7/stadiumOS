import json
import logging
from google import genai
from google.genai import types
from backend.app.config import GEMINI_API_KEY, USE_SIMULATOR

logger = logging.getLogger(__name__)

# System Instructions for the De-escalation Coach Agent
SYSTEM_INSTRUCTION = """
You are the Senior Crisis Psychologist and De-escalation Expert for FIFA Stadium Operations.
Your task is to provide real-time behavioral guidance and spoken de-escalation scripts to a volunteer who is dealing with an angry, panicked, or confused fan.

Inputs:
- Fan Query (English translation)
- Detected Fan Tone ("angry", "panicked", "confused")
- Incident Context (e.g., ticket dispute, lost child, seating mismatch)

You MUST generate a JSON response with:
1. "deescalation_script": What the volunteer should say immediately (keep it short, empathetic, reassuring, and clear).
2. "body_language_tips": Physical positioning guidelines (e.g., standing angle, open palms, tone of voice).
3. "tactical_step": The next immediate operations action the volunteer must take.

You MUST return a JSON object matching this schema:
{
  "deescalation_script": "string",
  "body_language_tips": "string",
  "tactical_step": "string"
}

Guidelines:
- Keep the script natural and simple for the volunteer to speak.
- Avoid formal language; focus on immediate tension reduction.
- Return ONLY raw JSON text.
"""

def coach_deescalation_genai(query: str, tone: str, context: str) -> dict:
    """Invokes Gemini to generate real-time de-escalation guidance."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = f"""
    Fan Query: {query}
    Tone: {tone}
    Context: {context}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.3
        )
    )
    
    result = json.loads(response.text.strip())
    return result

def coach_deescalation_simulator(query: str, tone: str, context: str) -> dict:
    """Local fallback simulator for de-escalation coaching."""
    if tone == "angry":
        script = "I hear you, and I want to get this resolved for you. Let me check with my section manager right now to sort this out."
        tips = "Lower your vocal pitch. Stand at a 45-degree angle to avoid a confrontational posture. Keep hands open and visible at chest height."
        step = "Maintain a calm demeanor and use the StadiumOS dashboard to page your supervisor."
    elif tone == "panicked":
        script = "Please take a deep breath. You are safe here, and I am going to stay with you until we solve this. Let's take it one step at a time."
        tips = "Maintain soft eye contact. Drop your shoulders to convey calm. Speak slowly and lower your volume to match or calm their energy."
        step = "Accompany the fan to the nearest cooling zone or information booth immediately."
    else:
        script = "I can certainly help you with that. Let's look at the routing map together."
        tips = "Smile politely. Keep an open posture. Point with an open hand, not a single finger."
        step = "Guide the fan toward their destination section."

    return {
        "deescalation_script": script,
        "body_language_tips": tips,
        "tactical_step": step
    }

def handle_deescalation(query: str, tone: str, context: str) -> dict:
    """Core entrypoint for de-escalation coach agent with simulator fallback."""
    if USE_SIMULATOR:
        logger.info("Using Local De-escalation Coach Simulator (No API Key)")
        return coach_deescalation_simulator(query, tone, context)
        
    try:
        return coach_deescalation_genai(query, tone, context)
    except Exception as e:
        logger.error(f"GenAI De-escalation Coach failed: {e}")
        return coach_deescalation_simulator(query, tone, context)
