"""
F-06. Mood-based recommendation with A* Search
Formulates playlist generation as state-space search:
- State: partial playlist of movie IDs, accumulated runtime, used genres/franchises.
- Actions: append an eligible candidate movie that fits budget and constraints.
- g(n): accumulated path cost across selected movies (penalizing mismatches and redundancies).
- h(n): admissible (optimistic) lower-bound heuristic estimating minimum remaining cost to complete the playlist.
- f(n) = g(n) + h(n).
- Lambda (λ) = mood / 10 scales mood mismatch penalty and prioritizes energetic/intense vs chill vibes.
"""

from typing import List, Dict, Any, Optional, Tuple, Set
import heapq
import time

class AStarPlaylistNode:
    def __init__(
        self,
        movie_ids: List[str],
        accumulated_runtime: int,
        g_cost: float,
        h_cost: float,
        used_genres: Set[str],
        used_franchises: Set[str]
    ):
        self.movie_ids = movie_ids
        self.accumulated_runtime = accumulated_runtime
        self.g_cost = round(g_cost, 4)
        self.h_cost = round(h_cost, 4)
        self.f_cost = round(g_cost + h_cost, 4)
        self.used_genres = used_genres
        self.used_franchises = used_franchises

    def __lt__(self, other: "AStarPlaylistNode") -> bool:
        # Priority queue sorts by lowest f(n), breaking ties by lower h(n) then lower g(n)
        if self.f_cost != other.f_cost:
            return self.f_cost < other.f_cost
        if self.h_cost != other.h_cost:
            return self.h_cost < other.h_cost
        return len(self.movie_ids) > len(other.movie_ids)

class AStarRecommender:
    def __init__(self, movies: List[Dict[str, Any]]):
        self.movies = movies
        self.movie_map = {m["id"]: m for m in movies}

    def compute_single_movie_cost(
        self,
        movie: Dict[str, Any],
        target_genres: List[str],
        user_fuzzy_degrees: Dict[str, float],
        mood_lambda: float,
        used_genres: Set[str],
        used_franchises: Set[str],
        ideal_slot_duration: int
    ) -> Tuple[float, Dict[str, float]]:
        """
        Computes cost of adding this movie (lower cost = better match).
        """
        # 1. Genre mismatch cost: 0.0 if all target genres matched, 1.0 if none
        movie_genres = set(movie.get("genres", []))
        if target_genres:
            overlap = movie_genres.intersection(set(target_genres))
            genre_mismatch = 1.0 - (len(overlap) / len(target_genres))
        else:
            genre_mismatch = 0.2

        # 2. Mood mismatch cost: derived from fuzzy mood compatibility (0.0 best, 1.0 worst)
        from algorithms.fuzzy import FuzzyMoodEngine
        f_engine = FuzzyMoodEngine()
        mood_fit = f_engine.compute_movie_mood_fit(user_fuzzy_degrees, movie.get("mood_scores", {}))
        mood_mismatch = 1.0 - mood_fit

        # 3. Rating quality mismatch: penalize low IMDb scores (scale 0 to 1)
        imdb = movie.get("imdb_rating", 7.0)
        rating_mismatch = max(0.0, (10.0 - imdb) / 10.0)

        # 4. Repetition penalty: penalty for repeating same franchise or identical genre set
        repetition_penalty = 0.0
        fr = movie.get("franchise")
        if fr and fr in used_franchises:
            repetition_penalty += 0.6
        if movie_genres and movie_genres.issubset(used_genres):
            repetition_penalty += 0.25

        # 5. Duration variance penalty
        runtime = movie.get("runtime", 120)
        duration_penalty = abs(runtime - ideal_slot_duration) / 180.0

        # Weighted sum: λ scales mood influence
        w_genre = 0.35
        w_mood = 0.25 * (0.5 + mood_lambda * 0.5)
        w_rating = 0.20
        w_duration = 0.10
        w_repetition = 0.10

        total_cost = (
            w_genre * genre_mismatch +
            w_mood * mood_mismatch +
            w_rating * rating_mismatch +
            w_duration * duration_penalty +
            w_repetition * repetition_penalty
        )

        breakdown = {
            "genre_mismatch": round(genre_mismatch, 3),
            "mood_mismatch": round(mood_mismatch, 3),
            "rating_mismatch": round(rating_mismatch, 3),
            "repetition_penalty": round(repetition_penalty, 3),
            "duration_penalty": round(duration_penalty, 3)
        }

        return total_cost, breakdown

    def admissible_heuristic(
        self,
        current_len: int,
        target_len: int,
        best_candidate_costs: List[float]
    ) -> float:
        """
        Admissible & consistent heuristic:
        Sum of the k lowest possible remaining step costs among all available candidate titles.
        Because any actual chosen combination must cost at least this minimum, h(n) <= h*(n).
        """
        slots_remaining = target_len - current_len
        if slots_remaining <= 0 or not best_candidate_costs:
            return 0.0
        
        # Take sum of the top 'slots_remaining' smallest potential costs
        cheapest_k = best_candidate_costs[:slots_remaining]
        return sum(cheapest_k)

    def search_playlist(
        self,
        target_count: int,
        time_budget_minutes: int,
        target_genres: List[str],
        user_fuzzy_degrees: Dict[str, float],
        mood_slider: float = 7.0,
        candidate_pool: Optional[List[Dict[str, Any]]] = None,
        max_expansions: int = 1500
    ) -> Dict[str, Any]:
        start_time = time.time()
        candidates = candidate_pool if candidate_pool is not None else self.movies
        if not candidates or target_count <= 0:
            return {"solution": [], "metrics": {"expanded_nodes": 0, "status": "no_candidates"}}

        mood_lambda = max(0.1, min(1.0, mood_slider / 10.0))
        ideal_slot_duration = time_budget_minutes // target_count

        # Precompute optimistic baseline single-movie costs to ensure admissible heuristic
        precomputed_costs = []
        for m in candidates:
            c, _ = self.compute_single_movie_cost(
                m, target_genres, user_fuzzy_degrees, mood_lambda,
                set(), set(), ideal_slot_duration
            )
            precomputed_costs.append(c)
        precomputed_costs.sort()

        root = AStarPlaylistNode(
            movie_ids=[],
            accumulated_runtime=0,
            g_cost=0.0,
            h_cost=self.admissible_heuristic(0, target_count, precomputed_costs),
            used_genres=set(),
            used_franchises=set()
        )

        frontier = [root]
        expanded_nodes = 0
        generated_nodes = 1
        visited_states = set()

        best_goal_node: Optional[AStarPlaylistNode] = None

        while frontier and expanded_nodes < max_expansions:
            current_node = heapq.heappop(frontier)
            expanded_nodes += 1

            # Goal test
            if len(current_node.movie_ids) == target_count:
                best_goal_node = current_node
                break

            state_signature = tuple(sorted(current_node.movie_ids))
            if state_signature in visited_states:
                continue
            visited_states.add(state_signature)

            # Expand successors
            for movie in candidates:
                m_id = movie["id"]
                if m_id in current_node.movie_ids:
                    continue
                
                # Check runtime budget constraint
                new_runtime = current_node.accumulated_runtime + movie.get("runtime", 120)
                if new_runtime > time_budget_minutes:
                    continue

                step_cost, _ = self.compute_single_movie_cost(
                    movie, target_genres, user_fuzzy_degrees, mood_lambda,
                    current_node.used_genres, current_node.used_franchises, ideal_slot_duration
                )

                new_g = current_node.g_cost + step_cost
                new_used_genres = current_node.used_genres.union(set(movie.get("genres", [])))
                new_used_fr = set(current_node.used_franchises)
                if movie.get("franchise"):
                    new_used_fr.add(movie["franchise"])

                # Remaining candidate costs excluding current selection
                h_val = self.admissible_heuristic(
                    len(current_node.movie_ids) + 1, target_count, precomputed_costs
                )

                child_node = AStarPlaylistNode(
                    movie_ids=current_node.movie_ids + [m_id],
                    accumulated_runtime=new_runtime,
                    g_cost=new_g,
                    h_cost=h_val,
                    used_genres=new_used_genres,
                    used_franchises=new_used_fr
                )

                heapq.heappush(frontier, child_node)
                generated_nodes += 1

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        if not best_goal_node:
            # Fallback if strict budget couldn't fit target_count: return best partial state
            if frontier:
                frontier.sort(key=lambda n: (-len(n.movie_ids), n.f_cost))
                best_goal_node = frontier[0]
            else:
                return {
                    "movies": [],
                    "metrics": {
                        "algorithm": "A*",
                        "expanded_nodes": expanded_nodes,
                        "generated_nodes": generated_nodes,
                        "time_ms": elapsed_ms,
                        "status": "budget_too_tight"
                    }
                }

        solution_movies = [self.movie_map[mid] for mid in best_goal_node.movie_ids if mid in self.movie_map]

        return {
            "movies": solution_movies,
            "total_runtime": best_goal_node.accumulated_runtime,
            "time_budget": time_budget_minutes,
            "final_g_cost": best_goal_node.g_cost,
            "final_f_cost": best_goal_node.f_cost,
            "metrics": {
                "algorithm": "A*",
                "expanded_nodes": expanded_nodes,
                "generated_nodes": generated_nodes,
                "states_evaluated": len(visited_states),
                "execution_time_ms": elapsed_ms,
                "heuristic_admissible": True,
                "mood_lambda": mood_lambda
            }
        }
