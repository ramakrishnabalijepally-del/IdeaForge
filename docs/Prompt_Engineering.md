# Prompt Engineering

## Initial Master Prompt

See [Master_Prompt.md](./Master_Prompt.md) for the complete initial specification.

---

## Gemini Prompts Used in the Application

### 1. AI Idea Generator System Prompt

**Location**: `backend/app/services/ai_generator.py`

**System prompt**:
```
You are an expert startup and manufacturing business consultant.
When given an industry, niche, or keyword, generate a comprehensive, realistic business idea report.
Return ONLY valid JSON matching the exact schema provided — no markdown fences, no extra keys.
All feasibility scores must be between 1.0 and 10.0.
Technical difficulty must be exactly one of: low, medium, high.
```

**User message template**:
```
Generate a detailed business idea for this niche/keyword: '{prompt}'

Return JSON matching this schema:
{
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
    ...5 steps...
  ]
}
```

**Engineering decisions**:
- `temperature=0.7` for creative variation in generated ideas
- Explicit "no markdown fences" instruction because LLMs frequently wrap JSON in ```json``` blocks despite JSON-only instructions; the service also strips fences defensively in code
- Schema provided inline in the user message (not the system prompt) to ensure it's always included in the specific generation request
- Explicit enum constraints ("exactly one of: low, medium, high") reduce hallucination of invalid values; code also validates and clamps these post-generation

### 2. RAG Search System Prompt

**Location**: `backend/app/services/rag_service.py`

**System prompt**:
```
You are a knowledgeable startup and manufacturing business advisor.
Answer the user's question using ONLY the provided idea database context.
Be specific, cite the idea titles when relevant, and keep your answer under 300 words.
```

**User message template**:
```
Context from idea database:
{retrieved_documents_joined_with_separator}

User question: {query}
```

**Engineering decisions**:
- `temperature=0.3` for factual, grounded responses (lower than the generator)
- "ONLY the provided idea database context" instruction reduces hallucination and keeps answers grounded in actual database content
- "cite the idea titles" instruction ensures the LLM references specific ideas, which the frontend can then link to
- 300-word limit prevents verbose, unfocused answers
- Context window: up to 5 retrieved ideas (each ~300 tokens), leaving room for the response

---

## Refinement Prompts Used During This Build

The following prompts were used during the actual development session with Claude Code:

| # | Prompt (paraphrased) | Why it was needed |
|---|---------------------|-------------------|
| 1 | "Build a production-ready, full-stack web application called IdeaForge…" (full master prompt) | Initial specification — the complete project brief defining all requirements |
| 2 | "confirm" | User confirmation of the scaffolded folder structure before implementation began |

> **Note**: This project was built in a single continuous session with Claude Code, following the incremental module-by-module approach specified in the master prompt's PROCESS section. The master prompt was comprehensive enough that no significant correction or refinement prompts were required beyond the initial confirmation. The `EXECUTION GUARDRAILS` and `PROCESS` sections of the master prompt were detailed enough to eliminate most ambiguity.

---

## Prompt Engineering Principles Applied

1. **Structured output enforcement**: The AI Idea Generator prompt specifies an exact JSON schema inline and instructs the model to return "ONLY valid JSON." Defensive post-processing (fence stripping, type coercion) handles model non-compliance.

2. **Grounding for RAG**: The search prompt explicitly limits the model to "ONLY the provided context" to prevent hallucination of ideas not in the database.

3. **Temperature tuning**: Generator (0.7) vs. search (0.3) — higher temperature for creative idea generation, lower for factual Q&A.

4. **Constraint specification in prompts**: Enum constraints (low/medium/high, score 1-10) stated explicitly in the system prompt, then validated in code — belt-and-suspenders approach.

5. **Role persona**: Both prompts establish domain-specific personas ("expert startup consultant", "knowledgeable business advisor") which improve response quality for the specific domain.
