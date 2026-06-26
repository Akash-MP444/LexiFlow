"""
All prompt strings used to call Gemini, kept as constants so they're easy to
tune without touching route/service logic. Mirrors plan section 10 exactly.
Each template is filled with .format(...) in app/services/ai_tasks.py.
"""
SIMPLIFY_PROMPT = """You are LexiFlow, an AI reading accessibility assistant.

Your goal is to make text easier to read while preserving every important fact.

LEVEL: {level}

Reading Levels:
- simplified:
  * ~8th-grade reading level
  * Shorter sentences
  * Common vocabulary
  * Define technical terms briefly

- very_simple:
  * ~5th-grade reading level
  * Maximum 12 words per sentence
  * One idea per sentence
  * Explain difficult words immediately

- eli5:
  * Explain like to a curious 5-year-old
  * Use one everyday analogy
  * Maximum 120 words
  * Friendly conversational tone

Formatting Rules:
1. NEVER return one giant paragraph.
2. Maximum 2-3 sentences per paragraph.
3. Insert a blank line between paragraphs.
4. When explaining multiple concepts, use bullet points.
5. Keep paragraphs visually short and easy to scan.
6. Preserve all original facts.
7. Do NOT add information not present in the source.
8. Make the output suitable for dyslexic and struggling readers.
9. Prioritize readability over academic writing style.

Example Output:

Quantum computing uses special rules from tiny particles.

Two important ideas are:

• Superposition — a particle can be in multiple states.

• Entanglement — particles stay connected.

These ideas help quantum computers solve some problems faster.

Return JSON:

{{"simplified_text": string}}

TEXT:
{input_text}
"""

KEY_POINTS_PROMPT = """Extract the 3-5 most important factual points from this text. Each point
must be a single short sentence, standalone and understandable without
reading the rest. Order by importance.

Return JSON: {{"key_points": string[]}}

TEXT:
{input_text}"""

SUMMARY_PROMPT = """Write a 2-3 sentence summary capturing the main idea and the single most
important supporting detail. Plain language, no jargon.

Return JSON: {{"summary": string}}

TEXT:
{input_text}"""

QUIZ_PROMPT = """Generate exactly 3 multiple-choice questions testing CONCEPTUAL
UNDERSTANDING (not vocabulary recall, not exact wording memorization).
4 choices each, exactly one correct. No "all of the above," no double
negatives. Base questions only on the text given.

Return JSON:
{{"questions": [{{"question": string, "choices": string[4], "answer_index": int}}]}}

TEXT:
{input_text}"""

WHY_CONFUSED_PROMPT = """The user selected a word or sentence while reading. Identify:
1. The single most difficult word or term in the selection (or null if
   none is genuinely difficult).
2. Its meaning in plain, everyday language.
3. A one-sentence simple explanation of the FULL selected text, using
   the surrounding context to resolve any hidden assumption or jargon.

Return JSON:
{{"difficult_word": string|null, "meaning": string, "simple_explanation": string}}

SELECTED TEXT:
{selected_text}

SURROUNDING CONTEXT:
{surrounding_context}"""

# Kept separate per plan section 10.7 for cases needing analogy-only output
# without a full rewrite. Not currently wired to a route, but available for
# future use from ai_tasks.py without inventing a new endpoint shape.
ELI5_ANALOGY_PROMPT = """Explain this concept using one clear everyday analogy a curious 8-year-old
would relate to (kitchen, playground, pets, sports — pick the best fit).
Map each part of the concept onto the analogy explicitly. Under 120 words.

Return JSON: {{"eli5_explanation": string}}

TEXT:
{input_text}"""
