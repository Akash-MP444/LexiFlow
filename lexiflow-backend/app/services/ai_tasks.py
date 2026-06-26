"""
One function per AI task. Each builds the right prompt from
app/prompts/prompt_templates.py, calls Gemini, and returns a plain dict
ready to be validated against the matching response schema.

Keeping this as its own module (rather than putting prompt-building logic
inside the routers) is what makes every route file look identical: receive
request -> call a service function -> return response model.
"""
from typing import Any, Dict

from app.prompts import prompt_templates as prompts
from app.services.gemini_client import call_gemini


def simplify_text(text: str, level: str) -> Dict[str, Any]:
    prompt = prompts.SIMPLIFY_PROMPT.format(level=level, input_text=text)
    data = call_gemini(prompt)
    simplified_text = data.get("simplified_text", "")
    simplified_text = simplified_text.replace(". ", ".\n\n")
    reading_time_sec = estimate_reading_time_sec(simplified_text)
    return {"simplified_text": simplified_text, "reading_time_sec": reading_time_sec}
    


def dyslexia_rewrite(text: str) -> Dict[str, Any]:
    prompt = prompts.DYSLEXIA_REWRITE_PROMPT.format(input_text=text)
    data = call_gemini(prompt)
    return {"rewritten_text": data.get("rewritten_text", "")}


def extract_key_points(text: str) -> Dict[str, Any]:
    prompt = prompts.KEY_POINTS_PROMPT.format(input_text=text)
    data = call_gemini(prompt)
    return {"key_points": data.get("key_points", [])}


def generate_summary(text: str) -> Dict[str, Any]:
    prompt = prompts.SUMMARY_PROMPT.format(input_text=text)
    data = call_gemini(prompt)
    return {"summary": data.get("summary", "")}


def generate_quiz(text: str) -> Dict[str, Any]:
    prompt = prompts.QUIZ_PROMPT.format(input_text=text)

    data = call_gemini(prompt)
    
    print("\n===== GEMINI QUIZ DATA =====")
    print(data)
    print("===========================\n")

    return {"questions": data.get("questions", [])}


def explain_confusion(selected_text: str, surrounding_context: str) -> Dict[str, Any]:
    prompt = prompts.WHY_CONFUSED_PROMPT.format(
        selected_text=selected_text,
        surrounding_context=surrounding_context or "(no additional context provided)",
    )
    data = call_gemini(prompt)
    return {
        "difficult_word": data.get("difficult_word"),
        "meaning": data.get("meaning", ""),
        "simple_explanation": data.get("simple_explanation", ""),
    }


def estimate_reading_time_sec(text: str, words_per_minute: int = 200) -> int:
    """Simple heuristic, no AI call needed — average adult silent reading speed."""
    word_count = len(text.split())
    minutes = word_count / words_per_minute
    return max(1, round(minutes * 60))
