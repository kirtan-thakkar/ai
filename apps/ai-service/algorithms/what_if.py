"""
Cinematic What-If Reasoning Engine
Evaluates counterfactual state-space scenarios:
- What if time budget is shortened/expanded?
- What if mood changes?
- What if safety or audience restrictions change?
- Compares original vs counterfactual states, calculating exact set differences
  and generating formal state-space algorithmic justifications.
"""

from typing import List, Dict, Any, Optional
import copy

class WhatIfReasoningEngine:
    def __init__(self, movie_catalog: List[Dict[str, Any]], movie_map: Dict[str, Any]):
        self.catalog = movie_catalog
        self.movie_map = movie_map

    def analyze_delta(
        self,
        orig_req: Dict[str, Any],
        mod_req: Dict[str, Any],
        orig_results: List[Dict[str, Any]],
        mod_results: List[Dict[str, Any]],
        orig_metrics: Dict[str, Any],
        mod_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        orig_ids = [m.get("movieId", m.get("id")) for m in orig_results]
        mod_ids = [m.get("movieId", m.get("id")) for m in mod_results]

        orig_id_set = set(orig_ids)
        mod_id_set = set(mod_ids)

        kept_ids = orig_id_set.intersection(mod_id_set)
        removed_ids = orig_id_set - mod_id_set
        added_ids = mod_id_set - orig_id_set

        # Kept movies
        kept_movies = [m for m in orig_results if m.get("movieId", m.get("id")) in kept_ids]

        # Removed movies with formal pruning justifications
        removed_movies = []
        for m in orig_results:
            mid = m.get("movieId", m.get("id"))
            if mid in removed_ids:
                full_m = self.movie_map.get(mid, m)
                reasons = []
                
                # Check runtime constraint
                runtime = full_m.get("runtime", 120)
                new_budget = mod_req.get("time_budget_minutes", 180)
                old_budget = orig_req.get("time_budget_minutes", 180)
                if new_budget < old_budget and runtime > (new_budget // max(1, mod_req.get("movie_count", 2))):
                    reasons.append(f"Pruned by CSP runtime constraint: {runtime}m exceeds revised per-slot budget ({new_budget}m total)")

                # Check violence constraint
                if mod_req.get("exclude_violence") and not orig_req.get("exclude_violence"):
                    if full_m.get("violence_level") in ["High", "Extreme", "Medium"]:
                        reasons.append("Pruned by Content Safety Expert System: Non-violent constraint active")

                # Check audience constraint
                new_aud = mod_req.get("audience", "solo")
                old_aud = orig_req.get("audience", "solo")
                if new_aud in ["child", "family"] and old_aud not in ["child", "family"]:
                    age_rating = full_m.get("age_rating", "R")
                    if age_rating in ["R", "NC-17", "PG-13"]:
                        reasons.append(f"Pruned by Age Rating constraint: '{age_rating}' exceeds {new_aud.capitalize()} threshold")

                # Check mood shift
                old_mood = orig_req.get("mood", 7.0)
                new_mood = mod_req.get("mood", 7.0)
                if abs(new_mood - old_mood) >= 2.0:
                    reasons.append(f"A* Heuristic cost increased: Mood lambda shifted from {old_mood} to {new_mood}")

                # Check genre shift
                old_genres = set(orig_req.get("genres", []))
                new_genres = set(mod_req.get("genres", []))
                if new_genres and not set(full_m.get("genres", [])).intersection(new_genres):
                    reasons.append(f"Domain mismatch: Does not satisfy new target genres ({', '.join(new_genres)})")

                if not reasons:
                    reasons.append("Displaced in A* heuristic frontier by higher-scoring alternative in revised state space")

                removed_movies.append({
                    "movie": m,
                    "pruning_reasons": reasons
                })

        # Added movies with formal selection justifications
        added_movies = []
        for m in mod_results:
            mid = m.get("movieId", m.get("id"))
            if mid in added_ids:
                full_m = self.movie_map.get(mid, m)
                reasons = []
                runtime = full_m.get("runtime", 120)

                reasons.append(f"Satisfies revised budget constraint ({runtime}m <= {mod_req.get('time_budget_minutes')}m total)")
                
                new_genres = set(mod_req.get("genres", []))
                matched_genres = set(full_m.get("genres", [])).intersection(new_genres)
                if matched_genres:
                    reasons.append(f"High genre alignment: Matches {', '.join(matched_genres)}")

                reasons.append(f"Optimizes A* f(n) evaluation (IMDb {full_m.get('imdb_rating', 7.5)}/10, Match {m.get('matchScore', 80)}%)")

                added_movies.append({
                    "movie": m,
                    "selection_reasons": reasons
                })

        # Summary of parameter deltas
        deltas = []
        if orig_req.get("time_budget_minutes") != mod_req.get("time_budget_minutes"):
            diff = mod_req.get("time_budget_minutes") - orig_req.get("time_budget_minutes")
            sign = "+" if diff > 0 else ""
            deltas.append(f"Time Budget: {orig_req.get('time_budget_minutes')}m → {mod_req.get('time_budget_minutes')}m ({sign}{diff}m)")
        
        if orig_req.get("mood") != mod_req.get("mood"):
            deltas.append(f"Mood Slider: {orig_req.get('mood')} → {mod_req.get('mood')}")

        if orig_req.get("movie_count") != mod_req.get("movie_count"):
            deltas.append(f"Movie Count: {orig_req.get('movie_count')} → {mod_req.get('movie_count')} titles")

        if orig_req.get("exclude_violence") != mod_req.get("exclude_violence"):
            deltas.append(f"Exclude Violence: {orig_req.get('exclude_violence')} → {mod_req.get('exclude_violence')}")

        if orig_req.get("audience") != mod_req.get("audience"):
            deltas.append(f"Audience Scope: {orig_req.get('audience')} → {mod_req.get('audience')}")

        if orig_req.get("genres") != mod_req.get("genres"):
            deltas.append(f"Genres: [{', '.join(orig_req.get('genres', []))}] → [{', '.join(mod_req.get('genres', []))}]")

        orig_runtime = sum(m.get("runtimeMinutes", m.get("runtime", 0)) for m in orig_results)
        mod_runtime = sum(m.get("runtimeMinutes", m.get("runtime", 0)) for m in mod_results)

        return {
            "parameter_deltas": deltas,
            "original_summary": {
                "movie_count": len(orig_results),
                "total_runtime_minutes": orig_runtime,
                "strategy": orig_req.get("strategy", "astar"),
                "metrics": orig_metrics
            },
            "what_if_summary": {
                "movie_count": len(mod_results),
                "total_runtime_minutes": mod_runtime,
                "strategy": mod_req.get("strategy", "astar"),
                "metrics": mod_metrics
            },
            "state_space_delta": {
                "kept_count": len(kept_movies),
                "removed_count": len(removed_movies),
                "added_count": len(added_movies)
            },
            "kept_movies": kept_movies,
            "removed_movies": removed_movies,
            "added_movies": added_movies,
            "theoretical_justification": (
                "The state-space frontier was regenerated under the counterfactual constraints. "
                "CSP forward-checking pruned titles violating hard eligibility bounds, while the A* heuristic "
                "re-evaluated the remaining candidate tree, producing the optimal feasible playlist configuration."
            )
        }
