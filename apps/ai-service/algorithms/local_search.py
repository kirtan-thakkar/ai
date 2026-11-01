"""
F-11. Playlist Shuffler – Refine My List
Local Search algorithms:
- Hill Climbing (greedy local improvement)
- Simulated Annealing (probabilistically accepts worse moves to escape local optima via cooling schedule)
Preserves locked/approved titles, swaps rejected titles with valid domain candidates,
and maximizes objective score: preference_fit + mood_fit + diversity - runtime_overrun - repetition.
"""

from typing import List, Dict, Any, Optional, Set
import random
import math
import time

class PlaylistLocalSearchOptimizer:
    def __init__(self, candidate_pool: List[Dict[str, Any]]):
        self.candidate_pool = candidate_pool
        self.movie_map = {m["id"]: m for m in candidate_pool}

    def evaluate_playlist(
        self,
        movie_ids: List[str],
        target_genres: List[str],
        user_fuzzy_degrees: Dict[str, float],
        time_budget_minutes: int,
        excluded_ids: Set[str]
    ) -> float:
        movies = [self.movie_map[mid] for mid in movie_ids if mid in self.movie_map]
        if not movies:
            return -1000.0

        # Disliked title penalty
        disliked_penalty = sum(100.0 for mid in movie_ids if mid in excluded_ids)

        # Runtime penalty
        total_runtime = sum(m.get("runtime", 120) for m in movies)
        overrun = max(0, total_runtime - time_budget_minutes)
        runtime_penalty = (overrun / 10.0) * 2.0

        # Preference fit (genre coverage)
        all_genres = set()
        for m in movies:
            all_genres.update(m.get("genres", []))
        genre_overlap = len(all_genres.intersection(set(target_genres)))
        genre_fit = (genre_overlap / max(1, len(target_genres))) * 40.0

        # Mood fit
        from algorithms.fuzzy import FuzzyMoodEngine
        f_engine = FuzzyMoodEngine()
        mood_fit = sum(f_engine.compute_movie_mood_fit(user_fuzzy_degrees, m.get("mood_scores", {})) for m in movies) / len(movies) * 30.0

        # Rating quality
        avg_rating = sum(m.get("imdb_rating", 7.0) for m in movies) / len(movies)
        rating_fit = (avg_rating / 10.0) * 20.0

        # Diversity
        fr_list = [m.get("franchise") for m in movies if m.get("franchise")]
        repetition_penalty = 15.0 if len(fr_list) != len(set(fr_list)) else 0.0

        score = genre_fit + mood_fit + rating_fit - runtime_penalty - disliked_penalty - repetition_penalty
        return round(score, 3)

    def refine_playlist(
        self,
        current_playlist_ids: List[str],
        locked_movie_ids: List[str],
        rejected_movie_ids: List[str],
        target_genres: List[str],
        user_fuzzy_degrees: Dict[str, float],
        time_budget_minutes: int,
        algorithm: str = "simulated_annealing", # or 'hill_climbing'
        max_iterations: int = 150,
        initial_temp: float = 100.0,
        cooling_rate: float = 0.94
    ) -> Dict[str, Any]:
        start_time = time.time()
        locked_set = set(locked_movie_ids)
        rejected_set = set(rejected_movie_ids)

        # Replacement domain pool excludes current locked movies and rejected titles
        replacement_candidates = [
            m for m in self.candidate_pool 
            if m["id"] not in locked_set and m["id"] not in rejected_set
        ]

        if not replacement_candidates:
            replacement_candidates = self.candidate_pool

        # Clean current playlist: if any title is in rejected_set, do an immediate initial swap
        current_state = list(current_playlist_ids)
        for i, mid in enumerate(current_state):
            if mid in rejected_set and mid not in locked_set:
                available = [m["id"] for m in replacement_candidates if m["id"] not in current_state]
                if available:
                    current_state[i] = random.choice(available)

        current_score = self.evaluate_playlist(
            current_state, target_genres, user_fuzzy_degrees, time_budget_minutes, rejected_set
        )

        best_state = list(current_state)
        best_score = current_score
        
        temperature = initial_temp
        iterations_run = 0
        worse_moves_accepted = 0
        score_trajectory = [current_score]

        for it in range(max_iterations):
            iterations_run += 1

            # Identify indices that can be mutated (not locked)
            mutable_indices = [idx for idx, mid in enumerate(current_state) if mid not in locked_set]
            if not mutable_indices:
                break

            swap_idx = random.choice(mutable_indices)
            candidate_ids = [m["id"] for m in replacement_candidates if m["id"] not in current_state]
            if not candidate_ids:
                break

            new_movie_id = random.choice(candidate_ids)
            neighbor_state = list(current_state)
            neighbor_state[swap_idx] = new_movie_id

            neighbor_score = self.evaluate_playlist(
                neighbor_state, target_genres, user_fuzzy_degrees, time_budget_minutes, rejected_set
            )

            delta = neighbor_score - current_score

            if algorithm == "hill_climbing":
                if delta > 0:
                    current_state = neighbor_state
                    current_score = neighbor_score
                    if current_score > best_score:
                        best_score = current_score
                        best_state = list(current_state)
            else: # Simulated Annealing
                if delta > 0:
                    current_state = neighbor_state
                    current_score = neighbor_score
                    if current_score > best_score:
                        best_score = current_score
                        best_state = list(current_state)
                else:
                    # Accept worse move with probability exp(delta / T)
                    acceptance_prob = math.exp(delta / max(0.001, temperature))
                    if random.random() < acceptance_prob:
                        current_state = neighbor_state
                        current_score = neighbor_score
                        worse_moves_accepted += 1

                temperature = max(0.001, temperature * cooling_rate)

            score_trajectory.append(current_score)

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        solution_movies = [self.movie_map[mid] for mid in best_state if mid in self.movie_map]

        return {
            "initial_score": score_trajectory[0],
            "best_score": best_score,
            "solution": solution_movies,
            "metrics": {
                "algorithm": "Simulated Annealing" if algorithm == "simulated_annealing" else "Hill Climbing",
                "iterations_completed": iterations_run,
                "worse_moves_accepted": worse_moves_accepted,
                "final_temperature": round(temperature, 4) if algorithm == "simulated_annealing" else None,
                "execution_time_ms": elapsed_ms,
                "score_trajectory": score_trajectory[::max(1, len(score_trajectory)//10)] # sampled 10 points
            }
        }
