"""
F-08. Beam Search Memory Saver
Heuristic bounded search:
- Retains only the best k partial plans at each depth.
- Prevents combinatorial memory explosion on large catalogues.
- Demonstrates trade-off between search efficiency/memory vs global optimality.
"""

from typing import List, Dict, Any, Optional
import time

class BeamSearchPlaylistPlanner:
    def __init__(self, candidates: List[Dict[str, Any]]):
        self.candidates = candidates
        self.movie_map = {m["id"]: m for m in candidates}

    def evaluate_state(
        self,
        movie_ids: List[str],
        target_genres: List[str],
        user_fuzzy_degrees: Dict[str, float],
        time_budget: int
    ) -> float:
        """
        Evaluation function f(s) to rank beam candidates (higher is better).
        Combines preference match, mood alignment, rating, and runtime efficiency.
        """
        movies = [self.movie_map[mid] for mid in movie_ids if mid in self.movie_map]
        if not movies:
            return 0.0

        total_runtime = sum(m.get("runtime", 120) for m in movies)
        if total_runtime > time_budget:
            return -1000.0 # Strict penalty for exceeding budget

        # 1. Genre coverage
        all_genres = set()
        for m in movies:
            all_genres.update(m.get("genres", []))
        genre_score = len(all_genres.intersection(set(target_genres))) / max(1, len(target_genres))

        # 2. Average rating
        avg_rating = sum(m.get("imdb_rating", 7.0) for m in movies) / len(movies)
        rating_score = avg_rating / 10.0

        # 3. Mood compatibility
        from algorithms.fuzzy import FuzzyMoodEngine
        f_engine = FuzzyMoodEngine()
        avg_mood_fit = sum(f_engine.compute_movie_mood_fit(user_fuzzy_degrees, m.get("mood_scores", {})) for m in movies) / len(movies)

        # 4. Runtime utilization (closer to budget without exceeding is rewarded)
        utilization = total_runtime / time_budget

        # 5. Diversity bonus (penalize franchise duplicate)
        fr_list = [m.get("franchise") for m in movies if m.get("franchise")]
        fr_penalty = 0.2 if len(fr_list) != len(set(fr_list)) else 0.0

        total_utility = (
            0.35 * genre_score +
            0.25 * avg_mood_fit +
            0.20 * rating_score +
            0.20 * utilization -
            fr_penalty
        )
        return round(total_utility, 4)

    def search(
        self,
        target_count: int,
        time_budget_minutes: int,
        target_genres: List[str],
        user_fuzzy_degrees: Dict[str, float],
        beam_width: int = 3
    ) -> Dict[str, Any]:
        start_time = time.time()
        k = max(1, beam_width)

        # State representation: list of movie_ids
        beam: List[List[str]] = [[]]
        depth_history = []
        total_generated = 0

        for depth in range(1, target_count + 1):
            candidates_at_depth = []
            
            for partial_plan in beam:
                for movie in self.candidates:
                    m_id = movie["id"]
                    if m_id in partial_plan:
                        continue
                    
                    next_plan = partial_plan + [m_id]
                    total_generated += 1
                    score = self.evaluate_state(next_plan, target_genres, user_fuzzy_degrees, time_budget_minutes)
                    
                    if score > -500: # Valid within budget
                        candidates_at_depth.append((score, next_plan))

            if not candidates_at_depth:
                break

            # Sort descending by score and keep only top k
            candidates_at_depth.sort(key=lambda item: item[0], reverse=True)
            beam = [plan for _, plan in candidates_at_depth[:k]]

            depth_history.append({
                "depth": depth,
                "candidates_generated": len(candidates_at_depth),
                "retained_beam_states": len(beam),
                "top_score_at_depth": candidates_at_depth[0][0]
            })

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        if not beam or not beam[0]:
            return {
                "solution": [],
                "metrics": {
                    "algorithm": f"Beam Search (k={k})",
                    "beam_width": k,
                    "status": "no_valid_path_under_budget",
                    "time_ms": elapsed_ms
                }
            }

        best_plan = beam[0]
        solution_movies = [self.movie_map[mid] for mid in best_plan if mid in self.movie_map]
        total_time = sum(m.get("runtime", 120) for m in solution_movies)
        final_score = self.evaluate_state(best_plan, target_genres, user_fuzzy_degrees, time_budget_minutes)

        # Unbounded theoretical space would be N! / (N - k)!
        theoretical_exhaustive_states = sum(len(self.candidates) ** d for d in range(1, target_count + 1))
        memory_reduction_pct = round(max(0.0, (1.0 - (total_generated / max(1, theoretical_exhaustive_states))) * 100), 1)

        return {
            "solution": solution_movies,
            "total_runtime": total_time,
            "budget_minutes": time_budget_minutes,
            "score": final_score,
            "metrics": {
                "algorithm": f"Beam Search (width k={k})",
                "beam_width": k,
                "total_states_generated": total_generated,
                "states_retained_per_depth": k,
                "depth_levels_completed": len(depth_history),
                "memory_reduction_pct": f"{memory_reduction_pct}%",
                "execution_time_ms": elapsed_ms,
                "depth_history": depth_history
            }
        }
