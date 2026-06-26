"""
Simple readability estimator.
No external dependencies.
"""

import re


def count_sentences(text):
    sentences = re.split(r'[.!?]+', text)
    return max(1, len([s for s in sentences if s.strip()]))


def count_words(text):
    return max(1, len(text.split()))


def count_syllables(word):
    word = word.lower()
    vowels = "aeiouy"
    count = 0
    prev = False

    for ch in word:
        is_vowel = ch in vowels
        if is_vowel and not prev:
            count += 1
        prev = is_vowel

    if word.endswith("e") and count > 1:
        count -= 1

    return max(1, count)


def total_syllables(text):
    return sum(count_syllables(word) for word in text.split())


def _suggest_level(grade):
    if grade <= 5:
        return "very_simple"
    if grade <= 8:
        return "simplified"
    if grade <= 12:
        return "standard"
    return "advanced"


def score_readability(text: str) -> dict:
    words = count_words(text)
    sentences = count_sentences(text)
    syllables = total_syllables(text)

    grade = (
        0.39 * (words / sentences)
        + 11.8 * (syllables / words)
        - 15.59
    )

    return {
        "flesch_kincaid_grade": round(grade, 2),
        "dale_chall_score": 0,
        "suggested_level": _suggest_level(grade),
    }