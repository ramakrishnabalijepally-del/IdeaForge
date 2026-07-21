import json
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

SYSTEM_PROMPT = """You are an expert startup and manufacturing business consultant.
When given an industry, niche, or keyword, generate a comprehensive, realistic business idea report.
Return ONLY valid JSON matching the exact schema provided — no markdown fences, no extra keys.
All feasibility scores must be between 1.0 and 10.0.
Technical difficulty must be exactly one of: low, medium, high."""

IDEA_SCHEMA = """{
  "title": "string — concise idea name",
  "problem_statement": "string — 2-3 sentences describing the core problem",
  "proposed_solution": "string — 2-3 sentences describing your solution",
  "target_market": "string — specific target customer segment with size estimate",
  "revenue_model": "string — how the business makes money (pricing, channels)",
  "feasibility_score": number between 1.0 and 10.0,
  "technical_difficulty": "low | medium | high",
  "competitive_landscape": "string — key competitors and your differentiation",
  "estimated_capital": "string — e.g. '$5,000 - $20,000'",
  "tags": ["array", "of", "keyword", "strings", "max 6"],
  "execution_roadmap": [
    {"step": 1, "title": "string", "description": "string"},
    {"step": 2, "title": "string", "description": "string"},
    {"step": 3, "title": "string", "description": "string"},
    {"step": 4, "title": "string", "description": "string"},
    {"step": 5, "title": "string", "description": "string"}
  ]
}"""


def generate_idea_report(prompt: str) -> dict:
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0.7,
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(
            content=f"Generate a detailed business idea for this niche/keyword: '{prompt}'\n\nReturn JSON matching this schema:\n{IDEA_SCHEMA}"
        ),
    ]

    response = llm.invoke(messages)
    raw = response.content.strip()

    # Strip markdown fences if model ignores instructions
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        report = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}\nRaw: {raw[:500]}")
        raise ValueError(f"AI returned malformed JSON: {e}")

    # Enforce schema constraints
    report["feasibility_score"] = max(1.0, min(10.0, float(report.get("feasibility_score", 5.0))))
    if report.get("technical_difficulty") not in ("low", "medium", "high"):
        report["technical_difficulty"] = "medium"

    return report
