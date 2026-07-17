import json
import logging
import re
from google import genai
from google.genai import types
from backend.app.config import GEMINI_API_KEY, USE_SIMULATOR

logger = logging.getLogger(__name__)

# Refined System Instructions for Multilingual Interaction Agent
SYSTEM_INSTRUCTION = """
You are the Senior Multilingual Interaction Agent for StadiumOS at the FIFA World Cup 2026.
Your task is to analyze text or transcribed audio input from a fan in a foreign language and generate a structured JSON response.

You MUST perform the following operations:
1. Detect the source language.
2. Detect the query Intent: "navigation_help", "medical_emergency", "security_threat", "lost_found", "ticketing_issue", or "general_inquiry".
3. Detect the query Tone: "calm", "panicked", "angry", or "polite".
4. Translate the fan's query into clear English (for the volunteer).
5. Generate a context-adapted, friendly, non-stiff reply in the fan's native language (avoid mechanical, word-for-word translations; make it sound natural).
6. Generate the English translation of this native reply.
7. Generate specific, tone-adapted instructions for the volunteer on what actions to take (in English).

You MUST return a JSON object matching this schema:
{
  "detected_language": "string",
  "intent": "string",
  "tone": "string",
  "translated_query": "string",
  "suggested_reply_native": "string",
  "suggested_reply_english": "string",
  "volunteer_instructions": "string"
}

Guidelines for Volunteer Instructions based on Tone:
- "panicked": Tell the volunteer to maintain eye contact, speak slowly, use hand gestures, and immediately escort them or call emergency services.
- "angry": Tell the volunteer to remain polite, avoid arguing, listen patiently, and call the section manager if needed.
- "polite" / "calm": Standard polite guidance instructions.
- Do not include markdown code block characters like ```json, return ONLY the raw JSON text.
"""

def translate_query_genai(query: str) -> dict:
    """Invokes Gemini to analyze, translate, and generate volunteer instructions."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    response = client.models.generate_content(
        model='gemini-3.1-pro',
        contents=f"Analyze and process this fan query: '{query}'",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.2
        )
    )
    
    result = json.loads(response.text.strip())
    return result

def translate_query_simulator(query: str) -> dict:
    """Rule-based local fallback translator supporting intent, tone, and contextual responses across 9+ languages."""
    query_lower = query.lower()
    
    # 1. Thai Detection (\u0e00-\u0e7f)
    if re.search(r"[\u0e00-\u0e7f]", query):
        if any(w in query_lower for w in ["ห้องน้ำ", "สุขา", "toilet", "restroom"]):
            return {
                "detected_language": "Thai",
                "intent": "navigation_help",
                "tone": "polite",
                "translated_query": "Where is the restroom / toilet?",
                "suggested_reply_native": "ห้องน้ำที่ใกล้ที่สุดอยู่ข้าง Section 101 ครับ/ค่ะ (The nearest restroom is next to Section 101.)",
                "suggested_reply_english": "The nearest restroom is next to Section 101.",
                "volunteer_instructions": "Point toward Section 101 corridor restroom and show standard restroom signage."
            }
        elif any(w in query_lower for w in ["ช่วยด้วย", "เจ็บ", "หมอ", "พยาบาล", "หัวใจ"]):
            return {
                "detected_language": "Thai",
                "intent": "medical_emergency",
                "tone": "panicked",
                "translated_query": "Help! I am hurt / need a doctor / chest pain.",
                "suggested_reply_native": "กรุณาทำตัวตามสบายครับ/ค่ะ ทีมแพทย์กำลังมาช่วยเหลือคุณแล้ว (Please stay calm. The medical team is on their way.)",
                "suggested_reply_english": "Please stay calm. The medical team is on their way to assist you.",
                "volunteer_instructions": "CRITICAL: Fan is experiencing a medical emergency. Have them sit down immediately, stay with them, and log a high-urgency report."
            }
        else:
            return {
                "detected_language": "Thai",
                "intent": "general_inquiry",
                "tone": "calm",
                "translated_query": query,
                "suggested_reply_native": "ฉันกำลังตรวจสอบเรื่องนี้ให้คุณอยู่ค่ะ กรุณารอสักครู่ (I am looking into this right now. Please wait.)",
                "suggested_reply_english": "I am looking into this right now. Please wait a moment.",
                "volunteer_instructions": "Listen carefully to the fan's query and escort them to the nearest Information booth if needed."
            }

    # 2. Japanese Detection (Hiragana/Katakana \u3040-\u30ff)
    elif re.search(r"[\u3040-\u30ff]", query):
        if any(w in query_lower for w in ["トイレ", "お手洗い"]):
            return {
                "detected_language": "Japanese",
                "intent": "navigation_help",
                "tone": "polite",
                "translated_query": "Where is the nearest restroom?",
                "suggested_reply_native": "一番近いお手洗いはセクション101の隣にあります。ご案内しましょうか？",
                "suggested_reply_english": "The nearest restroom is next to Section 101. Shall I guide you?",
                "volunteer_instructions": "Bow politely, point them towards Section 101, and guide them to the restroom corridor."
            }
        elif any(w in query_lower for w in ["助けて", "痛い", "医者", "救急"]):
            return {
                "detected_language": "Japanese",
                "intent": "medical_emergency",
                "tone": "panicked",
                "translated_query": "Help! I need a doctor / medical emergency.",
                "suggested_reply_native": "落ち着いてください。医療スタッフがすぐに向かっていますので、ここでお待ちください。",
                "suggested_reply_english": "Please stay calm. Medical staff are heading here, please wait here.",
                "volunteer_instructions": "Fan is panicked. Speak in a reassuring voice, keep them seated, and report a medical emergency immediately."
            }
        else:
            return {
                "detected_language": "Japanese",
                "intent": "general_inquiry",
                "tone": "calm",
                "translated_query": query,
                "suggested_reply_native": "ただいま確認しております。少々お待ちください。",
                "suggested_reply_english": "I am checking on this right now. Please wait a moment.",
                "volunteer_instructions": "Look up their query in your guide or refer them to Section Supervisor."
            }

    # 3. Chinese (Mandarin) Detection (CJK \u4e00-\u9fff)
    elif re.search(r"[\u4e00-\u9fff]", query):
        if any(w in query_lower for w in ["厕所", "洗手间", "卫生间", "在哪"]):
            return {
                "detected_language": "Mandarin Chinese",
                "intent": "navigation_help",
                "tone": "polite",
                "translated_query": "Where is the restroom / toilet?",
                "suggested_reply_native": "最近的洗手间在101区旁边。请往这边走。",
                "suggested_reply_english": "The nearest restroom is next to Section 101. Please go this way.",
                "volunteer_instructions": "Direct the fan towards the Section 101 corridor with clear hand gestures."
            }
        elif any(w in query_lower for w in ["救命", "疼", "医生", "不舒服", "医院"]):
            return {
                "detected_language": "Mandarin Chinese",
                "intent": "medical_emergency",
                "tone": "panicked",
                "translated_query": "Help! I am feeling unwell / need a doctor.",
                "suggested_reply_native": "请别慌张，医疗队已经在赶来的路上了。请先坐下休息。",
                "suggested_reply_english": "Please don't panic, the medical team is on their way. Please sit down and rest.",
                "volunteer_instructions": "Fan is panicked. Have them sit down, reassure them, and immediately page medical team via StadiumOS."
            }
        else:
            return {
                "detected_language": "Mandarin Chinese",
                "intent": "general_inquiry",
                "tone": "calm",
                "translated_query": query,
                "suggested_reply_native": "我正在帮您查询，请稍等一下。",
                "suggested_reply_english": "I am looking into this for you. Please wait a moment.",
                "volunteer_instructions": "Guide the fan to the main Information Booth if needed."
            }

    # 4. Arabic Detection (\u00600-\u06ff)
    elif re.search(r"[\u0600-\u06ff]", query):
        if any(w in query_lower for w in ["مرحاض", "حمام", "اين"]):
            return {
                "detected_language": "Arabic",
                "intent": "navigation_help",
                "tone": "polite",
                "translated_query": "Where is the toilet / restroom?",
                "suggested_reply_native": "المرحاض الأقرب يقع بجوار القسم 101. تفضل من هنا.",
                "suggested_reply_english": "The nearest restroom is next to Section 101. Please go this way.",
                "volunteer_instructions": "Direct the fan to Section 101 restroom area."
            }
        elif any(w in query_lower for w in ["مساعدة", "ألم", "طبيب", "إسعاف"]):
            return {
                "detected_language": "Arabic",
                "intent": "medical_emergency",
                "tone": "panicked",
                "translated_query": "Help! I need a doctor / ambulance.",
                "suggested_reply_native": "يرجى البقاء هادئًا. الفريق الطبي في الطريق لمساعدتك الآن.",
                "suggested_reply_english": "Please stay calm. The medical team is on the way to help you now.",
                "volunteer_instructions": "Keep the fan seated, speak reassuringly, and notify dispatchers immediately."
            }
        else:
            return {
                "detected_language": "Arabic",
                "intent": "general_inquiry",
                "tone": "calm",
                "translated_query": query,
                "suggested_reply_native": "أنا أبحث في هذا الأمر الآن. يرجى الانتظار لحظة واحدة.",
                "suggested_reply_english": "I am looking into this right now. Please wait a moment.",
                "volunteer_instructions": "Listen carefully, type query into StadiumOS translator, and assist."
            }

    # 5. French Detection & Mapping
    elif any(w in query_lower for w in ["où", "ou", "escalier", "billet", "fauteuil", "toilette"]):
        if "toilette" in query_lower:
            return {
                "detected_language": "French",
                "intent": "navigation_help",
                "tone": "calm",
                "translated_query": "Where is the nearest restroom/toilet?",
                "suggested_reply_native": "Les toilettes les plus proches se trouvent à côté de la section 101.",
                "suggested_reply_english": "The nearest restrooms are located next to Section 101.",
                "volunteer_instructions": "Point the fan towards Section 101 and indicate the restroom sign."
            }
        else:
            return {
                "detected_language": "French",
                "intent": "navigation_help",
                "tone": "calm",
                "translated_query": "Where can I find the ticketing desk or accessible seats?",
                "suggested_reply_native": "La billetterie se trouve à la Porte A. Si vous avez besoin d'aide pour vous déplacer, je peux demander un fauteuil roulant.",
                "suggested_reply_english": "The ticket resolution desk is at Gate A. If you need mobility help, I can request a wheelchair.",
                "volunteer_instructions": "Give the fan clear directions toward Gate A or page a mobility transport buggy if they seem tired."
            }

    # 6. Spanish Detection & Mapping
    elif any(w in query_lower for w in ["dónde", "donde", "ascensor", "baño", "bano", "entrada", "silla de ruedas", "dolor", "pecho", "médico", "medico", "ayuda", "desmayo", "sangre"]):
        if any(w in query_lower for w in ["dolor", "pecho", "médico", "medico", "ayuda", "desmayo", "sangre"]):
            return {
                "detected_language": "Spanish",
                "intent": "medical_emergency",
                "tone": "panicked",
                "translated_query": "Help, medical emergency, chest pain/fainting!",
                "suggested_reply_native": "Mantenga la calma, por favor. Un equipo médico ya está en camino para ayudarle. Quédese aquí conmigo.",
                "suggested_reply_english": "Please stay calm. A medical team is on the way to help you. Stay here with me.",
                "volunteer_instructions": "CRITICAL: Fan is panicked with a medical emergency. Have the fan sit down, speak in a reassuring voice, and immediately log this incident in StadiumOS to alert dispatchers."
            }
        else:
            return {
                "detected_language": "Spanish",
                "intent": "navigation_help",
                "tone": "polite",
                "translated_query": "Where is the nearest wheelchair elevator/restroom?",
                "suggested_reply_native": "El baño accesible y el ascensor más cercanos están detrás de la Sección 101. Permítame guiarlo.",
                "suggested_reply_english": "The nearest accessible restroom and elevator are behind Section 101. Let me guide you.",
                "volunteer_instructions": "Point to the directional signs for Section 101 and walk the fan to the West Concourse elevator."
            }

    # 7. German Detection
    elif any(w in query_lower for w in ["toilette", "wo ist", "hilfe", "arzt", "notfall", "eingang"]):
        if "toilette" in query_lower or "wc" in query_lower:
            return {
                "detected_language": "German",
                "intent": "navigation_help",
                "tone": "polite",
                "translated_query": "Where is the restroom?",
                "suggested_reply_native": "Die nächste Toilette befindet sich neben Sektor 101. Bitte folgen Sie mir.",
                "suggested_reply_english": "The nearest restroom is located next to Section 101. Please follow me.",
                "volunteer_instructions": "Show the fan the way to the restroom corridor behind Section 101."
            }
        else:
            return {
                "detected_language": "German",
                "intent": "medical_emergency" if any(w in query_lower for w in ["arzt", "notfall", "hilfe"]) else "general_inquiry",
                "tone": "panicked" if any(w in query_lower for w in ["arzt", "notfall", "hilfe"]) else "calm",
                "translated_query": "Where is the medical office / emergency?",
                "suggested_reply_native": "Bleiben Sie bitte ruhig. Ein medizinischer Dienst ist bereits unterwegs.",
                "suggested_reply_english": "Please stay calm. Medical assistance is already on the way.",
                "volunteer_instructions": "Help the fan sit down, speak calmly, and page the stadium medical team."
            }

    # 8. Portuguese Detection
    elif any(w in query_lower for w in ["banheiro", "onde fica", "socorro", "ajuda", "médico", "medico", "elevador"]):
        if "banheiro" in query_lower:
            return {
                "detected_language": "Portuguese",
                "intent": "navigation_help",
                "tone": "polite",
                "translated_query": "Where is the bathroom?",
                "suggested_reply_native": "O banheiro mais próximo fica ao lado da Seção 101. Siga por ali.",
                "suggested_reply_english": "The nearest restroom is next to Section 101. Follow that way.",
                "volunteer_instructions": "Point them towards the Section 101 restroom corridor."
            }
        else:
            return {
                "detected_language": "Portuguese",
                "intent": "medical_emergency" if any(w in query_lower for w in ["socorro", "médico", "medico", "ajuda"]) else "general_inquiry",
                "tone": "panicked" if any(w in query_lower for w in ["socorro", "médico", "medico", "ajuda"]) else "calm",
                "translated_query": "Help! I need medical aid / elevator.",
                "suggested_reply_native": "Por favor, acalme-se. A equipe médica está a caminho para ajudar você.",
                "suggested_reply_english": "Please stay calm. The medical team is on their way to help you.",
                "volunteer_instructions": "Escort them to the nearby shaded area and contact the medical responder team."
            }

    # 9. Italian Detection
    elif any(w in query_lower for w in ["bagno", "dov'è", "dove", "aiuto", "dottore", "ascensore"]):
        if "bagno" in query_lower:
            return {
                "detected_language": "Italian",
                "intent": "navigation_help",
                "tone": "polite",
                "translated_query": "Where is the bathroom?",
                "suggested_reply_native": "Il bagno più vicino si trova accanto alla Sezione 101. Da questa parte.",
                "suggested_reply_english": "The nearest restroom is next to Section 101. This way.",
                "volunteer_instructions": "Point towards Section 101 corridor."
            }
        else:
            return {
                "detected_language": "Italian",
                "intent": "medical_emergency" if any(w in query_lower for w in ["aiuto", "dottore"]) else "general_inquiry",
                "tone": "panicked" if any(w in query_lower for w in ["aiuto", "dottore"]) else "calm",
                "translated_query": "Help! I need a doctor.",
                "suggested_reply_native": "Per favore, mantenga la calma. Il personale medico sta arrivando.",
                "suggested_reply_english": "Please maintain calm. Medical staff is arriving.",
                "volunteer_instructions": "Comfort them and report a medical emergency."
            }
        
    # Default fallback (English or unsupported/unrecognized language)
    is_emergency = any(w in query_lower for w in ["emergency", "hurt", "dying", "fainted", "doctor", "security"])
    is_frustrated = any(w in query_lower for w in ["angry", "lost", "stole", "ticket", "wait", "late"])
    
    detected_lang = "English (or Unknown)"
    intent = "medical_emergency" if is_emergency else ("ticketing_issue" if "ticket" in query_lower else "general_inquiry")
    tone = "panicked" if is_emergency else ("angry" if is_frustrated else "calm")
    
    reply_native = "I am looking into this right now. Please give me one moment to assist you."
    instructions = "Listen carefully to the fan's query and cross-reference with stadium logs."
    
    if is_emergency:
        reply_native = "Please stay calm. I am contacting stadium medical services immediately."
        instructions = "Fan is panicked. Reassure them, keep them seated, and report a MEDICAL incident immediately."
    elif is_frustrated:
        reply_native = "I apologize for the delay. Let me check the registry to resolve your issue."
        instructions = "Fan is frustrated. Listen actively, do not interrupt, and keep a calm tone of voice."
        
    return {
        "detected_language": detected_lang,
        "intent": intent,
        "tone": tone,
        "translated_query": query,
        "suggested_reply_native": reply_native,
        "suggested_reply_english": reply_native,
        "volunteer_instructions": instructions
    }

def handle_translation(query: str) -> dict:
    """Core entrypoint that manages GenAI processing with a seamless local fallback."""
    if USE_SIMULATOR:
        logger.info("Using Local Translator Simulator (No API Key)")
        return translate_query_simulator(query)
        
    try:
        return translate_query_genai(query)
    except Exception as e:
        logger.error(f"GenAI Translation failed, falling back to simulator: {e}")
        return translate_query_simulator(query)
