"""
F-12. Couch War – Group Recommendation
1. Academic Viva Demonstration: 2-Player Adversarial Minimax with Alpha-Beta Pruning.
   - Player 1 (Maximizer) selects preferences; Player 2 (Minimizer) attempts to minimize utility disparity.
   - Evaluates tree of candidate movies and logs alpha-beta cutoffs.
2. Collaborative Group Fairness Engine (for 2+ participants):
   - Computes individual member utility u_i(m).
   - Enforces absolute vetoes (if any user vetos a genre or tag, utility = 0).
   - Max-Min Fairness: max_m (min_i u_i(m)) -> maximizes happiness of the least satisfied person.
   - Nash Social Welfare: max_m prod_i (u_i(m) + epsilon).
   - Produces transparent compromise rationale.
"""

from typing import List, Dict, Any, Optional, Tuple
import math
import time

class CouchWarEngine:
    def __init__(self, movie_catalog: List[Dict[str, Any]]):
        self.catalog = movie_catalog
        self.movie_map = {m["id"]: m for m in movie_catalog}

    def compute_user_movie_utility(
        self,
        movie: Dict[str, Any],
        liked_genres: List[str],
        disliked_genres: List[str],
        veto_genres: List[str],
        preferred_mood: Optional[str] = None
    ) -> float:
        genres = set(movie.get("genres", []))
        
        # Hard veto: if any vetoed genre is present, utility drops to zero
        if any(v in genres for v in veto_genres):
            return 0.0

        liked_matches = len(genres.intersection(set(liked_genres)))
        disliked_matches = len(genres.intersection(set(disliked_genres)))

        # Base genre score between 0.0 and 1.0
        genre_score = 0.5 + (0.25 * liked_matches) - (0.35 * disliked_matches)
        genre_score = max(0.05, min(1.0, genre_score))

        # Rating quality bonus
        imdb = movie.get("imdb_rating", 7.0) / 10.0

        # Mood alignment
        mood_fit = 0.5
        if preferred_mood and preferred_mood in movie.get("mood_scores", {}):
            mood_fit = movie["mood_scores"][preferred_mood]

        utility = 0.50 * genre_score + 0.30 * imdb + 0.20 * mood_fit
        return round(utility, 3)

    # -------------------------------------------------------------
    # 1. Minimax with Alpha-Beta Pruning (2-Player Academic Viva Demo)
    # -------------------------------------------------------------
    def run_minimax_demonstration(
        self,
        player1_prefs: Dict[str, Any],
        player2_prefs: Dict[str, Any],
        candidate_subset: Optional[List[Dict[str, Any]]] = None,
        max_depth: int = 3
    ) -> Dict[str, Any]:
        """
        Adversarial game-tree model where Player 1 seeks to maximize their satisfaction advantage,
        while Player 2 chooses defenses/counter-picks to minimize Player 1's score.
        Demonstrates alpha-beta cutoffs for academic syllabus compliance.
        """
        start_time = time.time()
        candidates = candidate_subset or self.catalog[:16] # Bounded set for tree depth
        
        cutoffs_count = 0
        nodes_evaluated = 0

        # Precompute utilities
        p1_utils = {
            m["id"]: self.compute_user_movie_utility(
                m, player1_prefs.get("liked_genres", []), player1_prefs.get("disliked_genres", []), player1_prefs.get("vetoes", [])
            ) for m in candidates
        }
        p2_utils = {
            m["id"]: self.compute_user_movie_utility(
                m, player2_prefs.get("liked_genres", []), player2_prefs.get("disliked_genres", []), player2_prefs.get("vetoes", [])
            ) for m in candidates
        }

        def minimax(depth: int, node_idx: int, is_maximizing: bool, alpha: float, beta: float, current_path: List[str]) -> Tuple[float, Optional[str]]:
            nonlocal cutoffs_count, nodes_evaluated
            nodes_evaluated += 1

            if depth == 0 or node_idx >= len(candidates):
                # Leaf evaluation: payoff difference U1 - U2
                m_id = candidates[min(node_idx, len(candidates)-1)]["id"]
                payoff = p1_utils[m_id] - p2_utils[m_id]
                return payoff, m_id

            if is_maximizing:
                max_eval = -math.inf
                best_movie = None
                # Branch across choices
                for step in range(2): # Branching factor b=2
                    child_idx = node_idx * 2 + step
                    if child_idx >= len(candidates):
                        continue
                    m_id = candidates[child_idx]["id"]
                    eval_val, _ = minimax(depth - 1, child_idx, False, alpha, beta, current_path + [m_id])
                    if eval_val > max_eval:
                        max_eval = eval_val
                        best_movie = m_id
                    alpha = max(alpha, eval_val)
                    if beta <= alpha:
                        cutoffs_count += 1
                        break # Beta cutoff!
                return max_eval, best_movie
            else:
                min_eval = math.inf
                best_movie = None
                for step in range(2):
                    child_idx = node_idx * 2 + step
                    if child_idx >= len(candidates):
                        continue
                    m_id = candidates[child_idx]["id"]
                    eval_val, _ = minimax(depth - 1, child_idx, True, alpha, beta, current_path + [m_id])
                    if eval_val < min_eval:
                        min_eval = eval_val
                        best_movie = m_id
                    beta = min(beta, eval_val)
                    if beta <= alpha:
                        cutoffs_count += 1
                        break # Alpha cutoff!
                return min_eval, best_movie

        optimal_val, selected_mid = minimax(max_depth, 0, True, -math.inf, math.inf, [])
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        chosen_movie = self.movie_map.get(selected_mid or candidates[0]["id"])

        return {
            "algorithm": "2-Player Minimax with Alpha-Beta Pruning",
            "selected_movie": chosen_movie,
            "minimax_payoff_differential": round(optimal_val, 3),
            "player1_utility": round(p1_utils.get(chosen_movie["id"], 0.5), 3),
            "player2_utility": round(p2_utils.get(chosen_movie["id"], 0.5), 3),
            "metrics": {
                "nodes_evaluated": nodes_evaluated,
                "alpha_beta_cutoffs": cutoffs_count,
                "tree_depth": max_depth,
                "execution_time_ms": elapsed_ms
            }
        }

    # -------------------------------------------------------------
    # 2. Collaborative Fair Aggregation (Max-Min & Nash Welfare)
    # -------------------------------------------------------------
    def recommend_for_group(
        self,
        participants: List[Dict[str, Any]], # list of {id, name, liked_genres, disliked_genres, vetoes, preferred_mood}
        top_k: int = 3
    ) -> Dict[str, Any]:
        """
        Collaborative multi-user recommender using Max-Min Fairness and Nash Social Welfare.
        """
        if not participants:
            return {"recommendations": [], "compromise_analysis": "No participants provided"}

        scored_candidates = []

        for m in self.catalog:
            member_utilities = {}
            has_veto = False

            for p in participants:
                u = self.compute_user_movie_utility(
                    m,
                    p.get("liked_genres", []),
                    p.get("disliked_genres", []),
                    p.get("vetoes", []),
                    p.get("preferred_mood")
                )
                if u <= 0.001:
                    has_veto = True
                member_utilities[p["name"]] = round(u, 3)

            if has_veto:
                continue

            utils = list(member_utilities.values())
            min_u = min(utils) # Max-Min objective
            avg_u = sum(utils) / len(utils)
            
            # Nash Social Welfare: product of utilities
            nash_product = 1.0
            for u in utils:
                nash_product *= (u + 0.05)

            scored_candidates.append({
                "movie": m,
                "min_satisfaction": min_u,
                "average_satisfaction": round(avg_u, 3),
                "nash_score": round(nash_product, 4),
                "member_breakdown": member_utilities
            })

        # Rank by Max-Min fairness first (safeguard the least happy person), breaking ties by Nash score
        scored_candidates.sort(key=lambda item: (item["min_satisfaction"], item["nash_score"]), reverse=True)
        top_results = scored_candidates[:top_k]

        compromise_notes = []
        if top_results:
            best = top_results[0]
            m_title = best["movie"]["title"]
            compromise_notes.append(
                f"Selected '{m_title}' using Max-Min Fairness: every participant has at least "
                f"{int(best['min_satisfaction'] * 100)}% satisfaction, with an overall average of {int(best['average_satisfaction'] * 100)}%."
            )

        return {
            "strategy": "Max-Min Group Fairness & Nash Social Welfare",
            "participant_count": len(participants),
            "recommendations": top_results,
            "compromise_analysis": " ".join(compromise_notes)
        }
