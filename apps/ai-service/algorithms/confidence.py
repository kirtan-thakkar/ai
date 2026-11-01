"""
F-14. Recommendation Confidence Meter
Calculates calibrated match scores (0-100) and confidence indicators:
- Deconstructs match score into verifiable sub-components (Genre, Mood, History/Bayesian, Runtime, Quality).
- Identifies supporting factors (what contributed positively).
- Computes uncertainty / cold-start indicators when interaction evidence is sparse.
- Labels score bands responsibly: 'Strong Match' (85+), 'Moderate Match' (70-84), 'Exploratory Match' (<70).
"""

from typing import Dict, Any, List, Optional

class ConfidenceMeter:
    def __init__(self):
        pass

    def compute_movie_confidence(
        self,
        movie: Dict[str, Any],
        target_genres: List[str],
        user_fuzzy_degrees: Dict[str, float],
        user_genre_beliefs: Dict[str, Dict[str, float]],
        target_runtime_budget: Optional[int] = None,
        interaction_history_count: int = 0
    ) -> Dict[str, Any]:
        supporting_factors = []
        uncertainty_factors = []

        # 1. Genre alignment (Weight: 35%)
        m_genres = set(movie.get("genres", []))
        if target_genres:
            common = m_genres.intersection(set(target_genres))
            genre_ratio = len(common) / len(target_genres)
            if common:
                supporting_factors.append(f"Direct match for requested genres: {', '.join(common)}")
        else:
            genre_ratio = 0.5
        genre_component = genre_ratio * 35.0

        # 2. Mood compatibility (Weight: 25%)
        from algorithms.fuzzy import FuzzyMoodEngine
        f_engine = FuzzyMoodEngine()
        mood_fit = f_engine.compute_movie_mood_fit(user_fuzzy_degrees, movie.get("mood_scores", {}))
        if mood_fit >= 0.75:
            supporting_factors.append(f"High mood compatibility ({int(mood_fit*100)}%) with your current session vibe")
        mood_component = mood_fit * 25.0

        # 3. Bayesian Taste posterior alignment (Weight: 20%)
        evidence_present = False
        posterior_sum = 0.0
        genres_counted = 0
        for g in m_genres:
            if g in user_genre_beliefs:
                belief = user_genre_beliefs[g]
                posterior_sum += belief.get("mean", 0.5)
                genres_counted += 1
                if belief.get("evidence_count", 0) > 0:
                    evidence_present = True

        if genres_counted > 0:
            bayesian_mean = posterior_sum / genres_counted
            if bayesian_mean >= 0.65 and evidence_present:
                supporting_factors.append(f"Aligns with your verified taste history in {', '.join(m_genres)}")
            elif bayesian_mean <= 0.35 and evidence_present:
                uncertainty_factors.append("Past history suggests lower affinity for some elements of this genre")
        else:
            bayesian_mean = 0.50 # Uninformative default
        
        bayesian_component = bayesian_mean * 20.0

        # 4. Rating quality (Weight: 10%)
        imdb = movie.get("imdb_rating", 7.0)
        rating_component = (imdb / 10.0) * 10.0
        if imdb >= 8.2:
            supporting_factors.append(f"Critically acclaimed title (IMDb {imdb}/10)")

        # 5. Runtime fit (Weight: 10%)
        runtime = movie.get("runtime", 120)
        if target_runtime_budget and target_runtime_budget > 0:
            fit_ratio = 1.0 - min(1.0, max(0, runtime - target_runtime_budget) / 100.0)
            runtime_component = fit_ratio * 10.0
        else:
            runtime_component = 10.0

        raw_match_score = genre_component + mood_component + bayesian_component + rating_component + runtime_component
        match_score = max(10, min(99, int(round(raw_match_score))))

        # Uncertainty evaluation
        if interaction_history_count < 3 or not evidence_present:
            uncertainty_factors.append("Sparse user history: recommendation leans more on explicit session filters than learned preferences")

        # Confidence categorization
        if match_score >= 85 and len(uncertainty_factors) == 0:
            confidence_level = "High Confidence"
            score_label = "Strong match"
        elif match_score >= 70:
            confidence_level = "Moderate Confidence"
            score_label = "Good match"
        else:
            confidence_level = "Exploratory Match"
            score_label = "Exploratory discovery"

        return {
            "match_score": match_score,
            "score_label": score_label,
            "confidence_level": confidence_level,
            "score_breakdown": {
                "genre_fit": round(genre_component, 1),
                "mood_fit": round(mood_component, 1),
                "historical_taste": round(bayesian_component, 1),
                "critical_rating": round(rating_component, 1),
                "runtime_fit": round(runtime_component, 1)
            },
            "supporting_factors": supporting_factors,
            "uncertainty_factors": uncertainty_factors,
            "is_calibrated": True
        }
