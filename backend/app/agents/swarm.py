import json
import logging
from google import genai
from google.genai import types
from backend.app.config import GEMINI_API_KEY, USE_SIMULATOR

logger = logging.getLogger(__name__)

# System instructions for the Swarm Leader
SWARM_LEADER_INSTRUCTION = """
You are the Chief Swarm Leader for StadiumOS at the FIFA World Cup 2026.
Your job is to receive a multi-dimensional stadium crisis event, coordinate the inputs from your 4 specialized sub-agents (Linguistic, Safety, Router, Ops), resolve any operational conflicts, and compile a unified response.

Sub-Agents:
1. Linguistic Mediator: Handles foreign translation, tone adjustment, and de-escalation scripts.
2. Safety Triage: Identifies medical, safety, and security hazards, and allocates medical/police resources.
3. Access Router: Maps step-free, wheelchair-friendly paths and bypasses active hazard zones.
4. Predictive Ops: Detects gate congestion bottlenecks and schedules volunteer redeployments.

You must return a unified, structured JSON playbook:
{
  "coordination_summary": "Overall summary of the swarm's coordinated action plan",
  "linguistic_playbook": "Translation & verbal script for the volunteer",
  "safety_playbook": "Emergency dispatch actions & medical triages",
  "routing_playbook": "Step-free routing details avoiding hazard zones",
  "ops_playbook": "Crowd diversion warnings & volunteer staffing movements"
}

Do not include markdown code block characters like ```json, return ONLY the raw JSON text.
"""

def coordinate_swarm_genai(event_description: str) -> dict:
    """Invokes Gemini model to simulate the collaborative multi-agent swarm."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = f"""
    Analyze and coordinate response playbooks for this complex stadium event:
    Event: '{event_description}'
    
    Perform collaborative reasoning among the 4 sub-agents:
    - Linguistic Mediator: Translate if foreign language, generate calm scripts.
    - Safety Triage: Check urgency, medical, or hazard.
    - Access Router: Maintain step-free routes, bypass blocked areas.
    - Predictive Ops: Route around bottlenecks, move volunteers.
    """
    
    response = client.models.generate_content(
        model='gemini-3.1-pro',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SWARM_LEADER_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.3
        )
    )
    
    result = json.loads(response.text.strip())
    return result

def coordinate_swarm_simulator(event_description: str) -> dict:
    """Local fallback simulator for the Multi-Agent Swarm Orchestrator."""
    desc_lower = event_description.lower()

    # ─────────────────────────────────────────────────────────────────────────
    # TIER 1 — LIFE-THREATENING / CRITICAL EMERGENCIES
    # Suffocation, choking, cardiac arrest, unconscious, not breathing, etc.
    # ─────────────────────────────────────────────────────────────────────────
    CRITICAL_KEYWORDS = [
        "suffocating", "suffocation", "choking", "choke", "can't breathe",
        "cannot breathe", "not breathing", "stopped breathing", "no pulse",
        "cardiac arrest", "heart attack", "unconscious", "unresponsive",
        "collapsed", "collapse", "seizure", "fitting", "convulsing",
        "anaphylaxis", "allergic reaction", "dying", "dead", "not moving",
        "crush", "trampled", "stampede", "stabbed", "stab", "shooting",
        "gunshot", "bleeding heavily", "severe bleeding", "major bleeding",
        "broken neck", "broken spine", "fracture", "severe injury",
        "life threatening", "life-threatening", "critical condition",
    ]
    if any(kw in desc_lower for kw in CRITICAL_KEYWORDS):
        return {
            "coordination_summary": (
                "🚨 CRITICAL LIFE-THREATENING EMERGENCY DETECTED. "
                "Swarm fully activated. EMT and AED cart dispatched immediately. "
                "Security corridor cleared. Command Center notified. All available "
                "medical personnel converging on location."
            ),
            "linguistic_playbook": (
                "Linguistic Mediator: ALL LANGUAGES — CRITICAL PRIORITY. "
                "Volunteer script: 'Please stand back and give space. Medical help is "
                "arriving RIGHT NOW. Do NOT move the person.' "
                "De-escalation active for surrounding crowd."
            ),
            "safety_playbook": (
                "⚠️ Safety Triage: CRITICAL URGENCY — LIFE AT RISK. "
                "Immediate actions: (1) Call 999/emergency services NOW if not already done. "
                "(2) Deploy nearest AED unit. (3) Begin CPR protocol if trained volunteer present. "
                "(4) Clear 10-metre radius around victim. "
                "(5) Log incident in StadiumOS as CRITICAL and escalate to Sector Commander."
            ),
            "routing_playbook": (
                "Access Router: EMERGENCY CORRIDOR ACTIVE. "
                "All pedestrian traffic re-routed away from this zone. "
                "EMT cart route: Main tunnel → East Concourse → victim location. "
                "Nearest hospital: designated stadium medical centre on Level 1 West."
            ),
            "ops_playbook": (
                "Predictive Ops: CRITICAL ALERT BROADCAST. "
                "5 nearest volunteers redirected to form a protective perimeter. "
                "Gate entries in this zone temporarily halted. "
                "PA system alert queued for crowd calming. "
                "Sector Supervisor paged immediately."
            ),
        }

    # ─────────────────────────────────────────────────────────────────────────
    # TIER 2 — HIGH URGENCY MEDICAL / SAFETY EVENTS
    # Fainted, unconscious-but-breathing, fire, fight, severe panic, etc.
    # ─────────────────────────────────────────────────────────────────────────
    HIGH_KEYWORDS = [
        "fainted", "faint", "passed out", "dizzy", "dizziness", "vomiting",
        "vomit", "chest pain", "chest pressure", "breathing difficulty",
        "difficulty breathing", "asthma", "asthma attack", "diabetic",
        "low blood sugar", "hypoglycemia", "broken bone", "fracture",
        "head injury", "concussion", "fire", "smoke", "bomb", "threat",
        "weapon", "fight", "fighting", "assault", "aggressive", "violence",
        "violent", "panic", "crowd panic", "dangerous", "emergency",
        "hurt badly", "badly injured", "serious injury",
    ]
    if any(kw in desc_lower for kw in HIGH_KEYWORDS):
        return {
            "coordination_summary": (
                "🔴 HIGH URGENCY EVENT. Swarm activated. Medical/security team alerted. "
                "Area being secured and crowd managed."
            ),
            "linguistic_playbook": (
                "Linguistic Mediator: High urgency mode. Volunteer script: "
                "'Please stay calm. Help is on the way. Can you tell me exactly what happened?' "
                "Translation active for all detected languages."
            ),
            "safety_playbook": (
                "Safety Triage: HIGH urgency. Actions: (1) Page sector medical team immediately. "
                "(2) Log this incident as HIGH priority in StadiumOS. "
                "(3) Keep victim calm and stationary until responders arrive. "
                "(4) Assess for additional casualties nearby."
            ),
            "routing_playbook": (
                "Access Router: Clearing approach routes for medical/security personnel. "
                "Nearest medical station flagged. Step-free access maintained on alternate route."
            ),
            "ops_playbook": (
                "Predictive Ops: Increased volunteer presence requested at this zone. "
                "Crowd diversion protocol activated. Nearby concessions notified to stay clear."
            ),
        }

    # ─────────────────────────────────────────────────────────────────────────
    # TIER 3 — MEDICAL / WELFARE (non-critical)
    # Minor injury, heat exhaustion, lost medication, etc.
    # ─────────────────────────────────────────────────────────────────────────
    MEDICAL_KEYWORDS = [
        "heat", "overheated", "dehydrated", "dehydration", "sunstroke",
        "nausea", "nauseous", "headache", "migraine", "injury", "injured",
        "bleeding", "cut", "bruise", "sprain", "twisted ankle", "pain",
        "hurting", "sick", "feeling unwell", "unwell", "medication",
        "insulin", "epipen", "wheelchair", "mobility", "disabled",
    ]
    if any(kw in desc_lower for kw in MEDICAL_KEYWORDS):
        return {
            "coordination_summary": (
                "🟡 Medical welfare event identified. First aid response dispatched. "
                "Fan being assisted with care and comfort protocols."
            ),
            "linguistic_playbook": (
                "Linguistic Mediator: Calm and reassuring tone. Script: "
                "'You are safe. We have a medical team nearby. Please sit down and rest. "
                "Can I get you some water?'"
            ),
            "safety_playbook": (
                "Safety Triage: MEDIUM urgency. First aid team paged to location. "
                "Vital signs assessment requested. Fan to be moved to shade/rest area if safe to do so."
            ),
            "routing_playbook": (
                "Access Router: Nearest first-aid station identified. "
                "Wheelchair or mobility buggy requested if fan cannot walk unaided."
            ),
            "ops_playbook": (
                "Predictive Ops: One volunteer reassigned to stay with fan until medics arrive. "
                "Nearby crowd gently dispersed to give space."
            ),
        }

    # ─────────────────────────────────────────────────────────────────────────
    # PRESET — Spanish speaker + Gate C bottleneck
    # ─────────────────────────────────────────────────────────────────────────
    if "spanish" in desc_lower or "médico" in desc_lower or "gate c" in desc_lower:
        return {
            "coordination_summary": "Coordinated Swarm Action: Medical team dispatched to Gate C ramp, incoming crowd traffic diverted to Gate D, Spanish translation active.",
            "linguistic_playbook": "Linguistic Mediator: Translated fan's panic about chest pain. Script for volunteer: 'Mantenga la calma, la ambulancia está en camino.' (Stay calm, the ambulance is on the way).",
            "safety_playbook": "Safety Triage: Identified HIGH urgency medical emergency. Triggered automated EMT cart dispatch to Gate C West Entrance.",
            "routing_playbook": "Access Router: Rerouted wheelchair path away from Gate C ramp (blocked by medical responders) to Elevator B and Section 102.",
            "ops_playbook": "Predictive Ops: Gate C is at 90% capacity; broadcasted diversion alerts to surrounding volunteers to redirect incoming flows to Gate D.",
        }

    # ─────────────────────────────────────────────────────────────────────────
    # PRESET — Lost child near wet ramp
    # ─────────────────────────────────────────────────────────────────────────
    if "lost" in desc_lower or "child" in desc_lower or "ramp" in desc_lower:
        return {
            "coordination_summary": "Coordinated Swarm Action: Lost child protocol active at West Info Booth. Facilities dispatching salt/mats to wet exit ramp.",
            "linguistic_playbook": "Linguistic Mediator: Translated French parent inquiry. Script: 'Votre enfant est en sécurité à la cabine d'information.' (Your child is safe at the info booth).",
            "safety_playbook": "Safety Triage: Medium urgency. Paged Section Supervisor and logged physical slip-hazard alert for the wet concourse ramp.",
            "routing_playbook": "Access Router: Redirected family routes away from the slippery outer ramp to internal covered escalators.",
            "ops_playbook": "Predictive Ops: Dispatched standby volunteers from low-density Section 102 to cover the info booth and help comfort the parent.",
        }

    # ─────────────────────────────────────────────────────────────────────────
    # DEFAULT — Genuinely routine / unclear event
    # ─────────────────────────────────────────────────────────────────────────
    return {
        "coordination_summary": "Coordinated Swarm Action: Situation assessed. No immediate hazard detected. Standard monitoring protocols in place.",
        "linguistic_playbook": "Linguistic Mediator: No translation required. Standard polite greeting and assistance script provided to volunteer.",
        "safety_playbook": "Safety Triage: Low urgency. No active medical or security hazards detected at this time. Situation being monitored.",
        "routing_playbook": "Access Router: All standard step-free paths clear and available via elevators and concourse routes.",
        "ops_playbook": "Predictive Ops: Crowd densities within normal range. Volunteers maintained at standard positions. No redeployments needed.",
    }

def handle_swarm_coordination(event_description: str) -> dict:
    """Core entrypoint for the Multi-Agent Swarm with simulator fallback."""
    if USE_SIMULATOR or not event_description:
        logger.info("Using Local Swarm Orchestrator Simulator (No API Key)")
        return coordinate_swarm_simulator(event_description)
        
    try:
        return coordinate_swarm_genai(event_description)
    except Exception as e:
        logger.error(f"GenAI Swarm Coordination failed: {e}")
        return coordinate_swarm_simulator(event_description)
