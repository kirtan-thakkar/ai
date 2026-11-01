"""
F-09. Smart Watchlist Sequencer
Algorithms: Greedy Best-First Search & Sequence Optimization
Optimizes viewing order of a user's saved watchlist to match specific cinematic narrative arcs:
- 'emotional_buildup': Light/Breezy -> Dramatic/Thoughtful -> High-intensity Climax
- 'release_chronology': Historic release order
- 'variety_pacing': Alternate genres to avoid fatigue and franchise repetition
Provides clear rationale for every position in the sequence.
"""

from typing import List, Dict, Any, Optional

class WatchlistSequencer:
    def __init__(self, movie_map: Optional[Dict[str, Dict[str, Any]]] = None):
        self.movie_map = movie_map or {}

    def get_intensity_score(self, movie: Dict[str, Any]) -> float:
        """Intensity estimated from mood_scores and genre."""
        moods = movie.get("mood_scores", {})
        intense = moods.get("intense", 0.5)
        energetic = moods.get("energetic", 0.5)
        chill = moods.get("chill", 0.5)
        # Intensity = (intense * 0.6 + energetic * 0.4) - chill * 0.3
        val = (intense * 0.6 + energetic * 0.4) - chill * 0.3
        return max(0.0, min(1.0, val))

    def sequence_watchlist(
        self,
        movies: List[Dict[str, Any]],
        arc_strategy: str = "emotional_buildup" # 'emotional_buildup', 'release_chronology', 'variety_pacing'
    ) -> Dict[str, Any]:
        if not movies:
            return {"sequenced_movies": [], "arc_strategy": arc_strategy}

        pool = list(movies)
        ordered: List[Dict[str, Any]] = []
        explanations: List[str] = []

        if arc_strategy == "release_chronology":
            ordered = sorted(pool, key=lambda m: m.get("release_year", 2000))
            for idx, m in enumerate(ordered):
                explanations.append(f"Position {idx+1}: Released in {m.get('release_year')} - preserves cinematic timeline progression.")
        
        elif arc_strategy == "variety_pacing":
            # Greedy Best-First Search for next movie with maximum genre/franchise diversity from previous
            current = pool.pop(0)
            ordered.append(current)
            explanations.append(f"Opening feature: Sets initial baseline with {', '.join(current.get('genres', []))}.")

            while pool:
                last_movie = ordered[-1]
                last_genres = set(last_movie.get("genres", []))
                last_fr = last_movie.get("franchise")

                # Best choice minimizes genre overlap with last and avoids same franchise
                def distance(m: Dict[str, Any]) -> float:
                    overlap = len(set(m.get("genres", [])).intersection(last_genres))
                    fr_penalty = 10.0 if (last_fr and m.get("franchise") == last_fr) else 0.0
                    return overlap + fr_penalty

                pool.sort(key=distance)
                chosen = pool.pop(0)
                ordered.append(chosen)
                explanations.append(
                    f"Position {len(ordered)}: Pacing switch to {', '.join(chosen.get('genres', []))} "
                    f"to prevent genre fatigue after '{last_movie.get('title')}'."
                )

        else: # 'emotional_buildup'
            # Sort by ascending intensity so viewing builds from comfortable/warm to edge-of-seat climax
            ordered = sorted(pool, key=self.get_intensity_score)
            n = len(ordered)
            for idx, m in enumerate(ordered):
                intensity = self.get_intensity_score(m)
                if idx == 0:
                    explanations.append(f"Warm-up / Appetizer (Intensity {intensity:.2f}): Welcoming tone to settle into the viewing session.")
                elif idx == n - 1:
                    explanations.append(f"Grand Climax (Intensity {intensity:.2f}): Highest stakes and narrative tension to conclude the marathon.")
                else:
                    explanations.append(f"Bridge / Acceleration (Intensity {intensity:.2f}): Deepens engagement and builds narrative momentum.")

        return {
            "sequenced_movies": ordered,
            "arc_strategy": arc_strategy,
            "position_explanations": explanations,
            "total_runtime_minutes": sum(m.get("runtime", 120) for m in ordered)
        }
