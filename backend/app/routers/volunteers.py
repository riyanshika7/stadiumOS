import logging

from fastapi import APIRouter, HTTPException

from backend.app.security import sanitize_llm_input, sanitize_response_detail
from backend.app.agents.volunteer_copilot import handle_copilot_analysis

logger = logging.getLogger("stadiumos.volunteers")
router = APIRouter(prefix="/api", tags=["Volunteer Co-Pilot"])


@router.post("/copilot")
async def copilot_analysis(payload: dict):
    """Analyze a multilingual fan query with Explainable AI (XAI).

    Three-field response: intent_and_context, reasoning_engine, actionable_script.
    User input is sanitized to block prompt-injection attempts before reaching the LLM.
    """
    query = (payload or {}).get("query", "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query is required.")

    try:
        result = handle_copilot_analysis(query)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=sanitize_response_detail(str(exc)))
    except Exception as exc:
        logger.error("Copilot analysis failed: %s", exc)
        raise HTTPException(status_code=500, detail="Copilot analysis failed.")

    return result
