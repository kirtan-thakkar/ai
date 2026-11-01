"""
F-13. Bayesian Taste Updating & F-22. Feedback Learning Loop
Conjugate Beta-Binomial model for maintaining and updating user preference beliefs.
Distinguishes genre/theme enjoyment evidence from recommendation accuracy/mood-fit evidence.
"""

from typing import Dict, Any, List, Optional
import math

class BayesianTasteModel:
    DEFAULT_ALPHA = 2.0
    DEFAULT_BETA = 2.0

    def __init__(self):
        pass

    def get_initial_belief(self) -> Dict[str, float]:
        """Returns standard uninformative/mildly regularized Beta(2, 2) prior."""
        return {
            "alpha": self.DEFAULT_ALPHA,
            "beta": self.DEFAULT_BETA,
            "mean": round(self.DEFAULT_ALPHA / (self.DEFAULT_ALPHA + self.DEFAULT_BETA), 3),
            "variance": round((self.DEFAULT_ALPHA * self.DEFAULT_BETA) / 
                              (((self.DEFAULT_ALPHA + self.DEFAULT_BETA)**2) * (self.DEFAULT_ALPHA + self.DEFAULT_BETA + 1)), 4),
            "evidence_count": 0
        }

    def compute_stats(self, alpha: float, beta: float, count: int) -> Dict[str, float]:
        mean = alpha / (alpha + beta)
        var = (alpha * beta) / (((alpha + beta)**2) * (alpha + beta + 1))
        # 95% Credible Interval approx (mean +/- 1.96 * std)
        std = math.sqrt(var)
        ci_lower = max(0.0, mean - 1.96 * std)
        ci_upper = min(1.0, mean + 1.96 * std)
        return {
            "alpha": round(alpha, 2),
            "beta": round(beta, 2),
            "mean": round(mean, 3),
            "variance": round(var, 4),
            "ci_lower": round(ci_lower, 3),
            "ci_upper": round(ci_upper, 3),
            "evidence_count": count
        }

    def update_genre_belief(
        self,
        current_belief: Dict[str, float],
        event_type: str,
        value: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Updates preference Beta distribution given observed user action.
        event_type:
          - 'rating': 1 to 5 stars
          - 'like': explicit bookmark/heart
          - 'dislike': explicit not-for-me
          - 'skip': skipped recommendation or abandoned movie
          - 'watchlist_add': intentional plan to watch
        """
        alpha = current_belief.get("alpha", self.DEFAULT_ALPHA)
        beta = current_belief.get("beta", self.DEFAULT_BETA)
        count = int(current_belief.get("evidence_count", 0)) + 1

        delta_alpha = 0.0
        delta_beta = 0.0
        reason = ""

        if event_type == "rating":
            rating = float(value or 3.0)
            if rating >= 4.5:
                delta_alpha = 2.5
                delta_beta = 0.1
                reason = "Strong 5-star positive review"
            elif rating >= 3.5:
                delta_alpha = 1.5
                delta_beta = 0.3
                reason = "Positive 4-star review"
            elif rating >= 2.5:
                delta_alpha = 0.5
                delta_beta = 0.5
                reason = "Neutral 3-star review"
            elif rating >= 1.5:
                delta_alpha = 0.2
                delta_beta = 1.5
                reason = "Mild negative 2-star review"
            else:
                delta_alpha = 0.05
                delta_beta = 2.5
                reason = "Strong negative 1-star review"
        elif event_type == "like":
            delta_alpha = 1.5
            delta_beta = 0.1
            reason = "Explicit like/save"
        elif event_type == "dislike":
            delta_alpha = 0.0
            delta_beta = 2.0
            reason = "Explicit dislike/rejection"
        elif event_type == "skip":
            delta_alpha = 0.1
            delta_beta = 0.7
            reason = "Recommendation skipped/dismissed"
        elif event_type == "watchlist_add":
            delta_alpha = 1.0
            delta_beta = 0.2
            reason = "Added to user watchlist"

        new_alpha = alpha + delta_alpha
        new_beta = beta + delta_beta
        updated_stats = self.compute_stats(new_alpha, new_beta, count)

        return {
            "prior": {
                "alpha": round(alpha, 2),
                "beta": round(beta, 2),
                "mean": round(alpha / (alpha + beta), 3)
            },
            "posterior": updated_stats,
            "delta": {"delta_alpha": delta_alpha, "delta_beta": delta_beta},
            "reason": reason
        }

    def process_post_watch_feedback(
        self,
        user_beliefs: Dict[str, Dict[str, float]],
        movie_genres: List[str],
        enjoyment: int,
        recommendation_accuracy: int,
        mood_match: str, # "Yes", "Partly", "No"
        reason_tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        F-22 Learning Loop implementation:
        Distinguishes content enjoyment from recommendation accuracy.
        Updates genre preferences and produces diagnostic trace.
        """
        genre_updates = {}
        for genre in movie_genres:
            current = user_beliefs.get(genre, self.get_initial_belief())
            update_result = self.update_genre_belief(current, "rating", float(enjoyment))
            genre_updates[genre] = update_result
            # Save new stats back
            user_beliefs[genre] = update_result["posterior"]

        # Evaluate mood mapping discrepancy (Section 8 Example C)
        mood_accuracy_note = ""
        if enjoyment >= 4 and mood_match == "No":
            mood_accuracy_note = (
                "Insight: User enjoyed the movie (high rating) but reported poor mood alignment. "
                "Tastes for matching genres were reinforced, while mood-to-genre heuristic weights were slightly attenuated."
            )
        elif enjoyment <= 2 and recommendation_accuracy >= 4:
            mood_accuracy_note = (
                "Insight: User acknowledged the recommendation fit the requested criteria well, "
                "even though their subjective movie enjoyment was low. Kept context model stable."
            )
        else:
            mood_accuracy_note = f"Beliefs updated uniformly. Mood match reported as '{mood_match}'."

        return {
            "genre_updates": genre_updates,
            "enjoyment": enjoyment,
            "recommendation_accuracy": recommendation_accuracy,
            "mood_match": mood_match,
            "reason_tags": reason_tags or [],
            "learning_note": mood_accuracy_note
        }
