from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
from datetime import datetime

# Translation schemas
class TranslateRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Raw query from the fan")

    @field_validator("query")
    @classmethod
    def validate_llm_bound_query(cls, value: str) -> str:
        from backend.app.security import sanitize_llm_input
        return sanitize_llm_input(value)

class IntentDetection(BaseModel):
    detected_language: str
    intent: str
    tone: str
    translated_query: str

class TranslateResponse(BaseModel):
    detected_language: str
    intent: str
    tone: str
    translated_query: str
    suggested_reply_native: str
    suggested_reply_english: str
    volunteer_instructions: str
    
    # Frontend compatibility
    translated_response: Optional[str] = None
    actionable_instruction: Optional[str] = None
    reasoning_engine: Optional[str] = None
    plain_english_reasoning: Optional[str] = None
    actionable_script: Optional[str] = None
    
    # XAI / test compatibility
    intent_detection: Optional[IntentDetection] = None
    reasoning: Optional[str] = None

# Incident schemas
class IncidentCreate(BaseModel):
    description: str = Field(..., min_length=3, description="Raw voice or text report from the volunteer")

class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    urgency: str
    location: str
    description: str
    required_action: str
    status: str
    reported_at: datetime
    resolved_at: Optional[datetime] = None

class IncidentUpdateStatus(BaseModel):
    status: str = Field(..., description="New status (open, in_progress, resolved)")

# Navigation schemas
class NavigationRequest(BaseModel):
    start_location: str = Field(..., description="Name of start location")
    destination: Optional[str] = Field(None, description="Name of destination location")
    wheelchair: Optional[bool] = Field(False, description="Wheelchair accessibility needed")
    visual: Optional[bool] = Field(False, description="Visual impairment assistance needed")
    stroller: Optional[bool] = Field(False, description="Stroller/family assistance needed")
    
    # Frontend properties compatibility
    end_location: Optional[str] = Field(None, description="Name of destination location")
    accessibility_needs: Optional[List[str]] = Field(None, description="List of accessibility requirements")

class NavigationResponse(BaseModel):
    route_description: str
    key_locations_passed: List[str]
    accessibility_features_highlighted: List[str]
    estimated_time_minutes: int
    visual_path_coordinates: Optional[List[List[float]]] = []

# Alert schemas
class AlertCreate(BaseModel):
    title: str = Field(..., description="Brief headline of the alert")
    message: str = Field(..., description="Detailed alert body text")
    type: str = Field("info", description="Alert severity: info, warning, critical")

class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    type: str
    active: bool
    created_at: datetime

# Location schemas
class LocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: str
    accessibility_features: str
    crowd_level: str
    crowd_factor: float
    description: str

# Ticket Vision schemas (New V2.0)
class TicketVisionRequest(BaseModel):
    image_b64: str = Field(..., description="Base64 encoded ticket image")
    ticket_type: Optional[str] = Field("general", description="Simulated ticket profile: general, vip, accessible, fake")
    filename: Optional[str] = Field("", description="Optional original filename of the uploaded image")

class TicketVisionResponse(BaseModel):
    gate: str
    section: str
    row: str
    seat: str
    category: str
    is_valid: bool
    issue_detected: str
    volunteer_action_guide: str

# De-escalation Coach schemas (New V2.0)
class DeescalateRequest(BaseModel):
    query: str = Field(..., description="Translated fan query")
    tone: str = Field(..., description="Detected fan tone (angry, panicked, etc)")
    context: str = Field(..., description="Description of dispute/situation context")

class DeescalateResponse(BaseModel):
    deescalation_script: str
    body_language_tips: str
    tactical_step: str

# Ambient Insights schemas (New V2.0 Invisible AI)
class AmbientInsightsResponse(BaseModel):
    predicted_problems: List[str]
    recommended_actions: List[str]
    automated_workflows: List[str]

# CCTV Surveillance schemas (New V2.0 "That's Brilliant")
class CctvTriageRequest(BaseModel):
    image_b64: str = Field(..., description="Base64 encoded CCTV snapshot")
    scenario: str = Field("normal", description="Simulator scenario (normal, surge, medical)")

class CctvTriageResponse(BaseModel):
    risk_index: int
    anomaly_detected: str
    predicted_impact: str
    automated_dispatch_action: str

# Multi-Agent Swarm schemas (New V2.0 Top 1% Engineering)
class SwarmRequest(BaseModel):
    event_description: str = Field(..., description="Description of the multi-dimensional crisis")

class SwarmResponse(BaseModel):
    coordination_summary: str
    linguistic_playbook: str
    safety_playbook: str
    routing_playbook: str
    ops_playbook: str

# Chaos Simulator schemas (Senior QA Portal red team tests)
class ChaosRequest(BaseModel):
    scenario: str = Field(..., description="The QA edge case scenario: corrupt_csv, simultaneous_capacity, or unknown_audio")

class ChaosResponse(BaseModel):
    status: str
    error_caught: str
    fallback_message: str
    resolution_steps: List[str]

# Mission Commander schemas
class MissionCommanderRequest(BaseModel):
    situation: str = Field(..., description="The reported operational situation text")

class RecommendationItem(BaseModel):
    action: str
    why: str

class MissionCommanderResponse(BaseModel):
    situation_summary: str
    ai_reasoning: str
    risk_level: str
    affected_zones: List[str]
    fans_impacted: int
    accessibility_impact: str
    medical_impact: str
    security_impact: str
    transportation_impact: str
    predicted_resolution_time: str
    confidence_score: float
    recommendations: List[RecommendationItem]
    timeline: List[str]
