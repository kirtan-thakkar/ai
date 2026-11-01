"""
F-17. Fuzzy Mood Detection
Complementing the numeric 1-10 mood slider with fuzzy sets.
Represents soft linguistic categories: Chill, Balanced, Energetic, Intense, Thoughtful, Feel-Good.
"""

from typing import Dict, Any, List

def triangular_membership(x: float, a: float, b: float, c: float) -> float:
    """Triangular fuzzy membership function."""
    if x <= a or x >= c:
        return 0.0
    elif a < x <= b:
        return (x - a) / (b - a) if b != a else 1.0
    else:
        return (c - x) / (c - b) if c != b else 1.0

def trapezoidal_membership(x: float, a: float, b: float, c: float, d: float) -> float:
    """Trapezoidal fuzzy membership function."""
    if x <= a or x >= d:
        return 0.0
    elif a < x < b:
        return (x - a) / (b - a) if b != a else 1.0
    elif b <= x <= c:
        return 1.0
    else:
        return (d - x) / (d - c) if d != c else 1.0

class FuzzyMoodEngine:
    def __init__(self):
        # Keyword mapping to boost specific fuzzy sets
        self.keyword_mappings = {
            "chill": ["relax", "chill", "calm", "gentle", "peaceful", "rainy", "cozy", "lazy"],
            "balanced": ["balanced", "steady", "classic", "standard", "mellow"],
            "energetic": ["energetic", "fun", "action", "excited", "hype", "adventure", "upbeat"],
            "intense": ["intense", "thrilling", "dark", "gripping", "mind-bending", "scary", "edge-of-seat"],
            "thoughtful": ["thoughtful", "philosophical", "deep", "complex", "artistic", "intellectual"],
            "feel_good": ["wholesome", "feel-good", "uplifting", "happy", "heartwarming", "joyful", "light"]
        }

    def evaluate_slider(self, mood_val: float) -> Dict[str, float]:
        """
        Evaluate numeric mood (1.0 to 10.0) against fuzzy sets.
        Returns degree of membership in [0.0, 1.0] for each category.
        """
        x = max(1.0, min(10.0, float(mood_val)))
        chill = trapezoidal_membership(x, 1.0, 1.0, 2.5, 4.5)
        balanced = triangular_membership(x, 3.0, 5.0, 7.0)
        energetic = triangular_membership(x, 5.5, 7.5, 9.0)
        intense = trapezoidal_membership(x, 7.5, 9.0, 10.0, 10.0)
        
        # Thoughtful and feel-good can overlap across mid to high or low to mid
        thoughtful = trapezoidal_membership(x, 4.0, 6.0, 8.5, 10.0)
        feel_good = trapezoidal_membership(x, 1.0, 2.0, 6.0, 8.0)

        raw = {
            "chill": round(chill, 3),
            "balanced": round(balanced, 3),
            "energetic": round(energetic, 3),
            "intense": round(intense, 3),
            "thoughtful": round(thoughtful, 3),
            "feel_good": round(feel_good, 3)
        }
        return raw

    def evaluate_text_and_slider(self, mood_val: float, text_query: str = "") -> Dict[str, Any]:
        """
        Combines numeric mood slider with natural language cues using fuzzy union (s-norm: max).
        """
        memberships = self.evaluate_slider(mood_val)
        
        detected_keywords = []
        if text_query:
            query_lower = text_query.lower()
            for mood_category, kw_list in self.keyword_mappings.items():
                for kw in kw_list:
                    if kw in query_lower:
                        detected_keywords.append((kw, mood_category))
                        # Fuzzy s-norm / reinforcement: boost category degree
                        memberships[mood_category] = min(1.0, round(memberships.get(mood_category, 0.0) + 0.45, 3))

        # Find dominant mood
        dominant_mood = max(memberships.items(), key=lambda item: item[1])[0]

        return {
            "slider_value": mood_val,
            "membership_degrees": memberships,
            "dominant_mood": dominant_mood,
            "detected_keywords": detected_keywords,
            "explanation": f"Mood {mood_val}/10 maps primarily to '{dominant_mood}' (degree {memberships[dominant_mood]:.2f}) with fuzzy distribution across chill ({memberships['chill']:.2f}), energetic ({memberships['energetic']:.2f}), and intense ({memberships['intense']:.2f})."
        }

    def compute_movie_mood_fit(self, user_fuzzy_degrees: Dict[str, float], movie_mood_scores: Dict[str, float]) -> float:
        """
        Calculates compatibility score between user fuzzy mood vector and movie mood vector.
        Range: 0.0 to 1.0.
        """
        dot_product = 0.0
        total_user_weight = 0.0
        
        for key in ["chill", "energetic", "intense", "thoughtful", "feel_good"]:
            u_deg = user_fuzzy_degrees.get(key, 0.0)
            m_score = movie_mood_scores.get(key, 0.5)
            dot_product += u_deg * m_score
            total_user_weight += u_deg

        if total_user_weight <= 0.001:
            return 0.5
        
        fit = dot_product / total_user_weight
        return max(0.0, min(1.0, round(fit, 3)))
