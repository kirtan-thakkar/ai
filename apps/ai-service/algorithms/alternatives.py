"""
F-10. Alternative Movie Finder
Algorithm: Heuristic Nearest-Neighbor (k-NN) Feature Vector Similarity
Finds high-quality substitutes for any target movie.
Computes multi-attribute distance:
- Genre Jaccard similarity (30%)
- Theme overlap (20%)
- Mood vector cosine similarity (20%)
- Director & Cast overlap (15%)
- Runtime proximity penalty (15%)
Generates explicit natural language explanations of why each title is an ideal alternative.
"""

from typing import List, Dict, Any, Optional
import math

class AlternativeMovieFinder:
    def __init__(self, movie_catalog: List[Dict[str, Any]]):
        self.catalog = movie_catalog
        self.movie_map = {m["id"]: m for m in movie_catalog}

    def compute_similarity(self, source: Dict[str, Any], candidate: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Genre Jaccard
        s_genres = set(source.get("genres", []))
        c_genres = set(candidate.get("genres", []))
        union = s_genres.union(c_genres)
        genre_jaccard = len(s_genres.intersection(c_genres)) / max(1, len(union))

        # 2. Theme overlap
        s_themes = set(source.get("themes", []))
        c_themes = set(candidate.get("themes", []))
        theme_overlap = len(s_themes.intersection(c_themes)) / max(1, len(s_themes.union(c_themes)))

        # 3. Director & Cast
        s_dir = set(source.get("directors", []))
        c_dir = set(candidate.get("directors", []))
        director_match = 1.0 if s_dir.intersection(c_dir) else 0.0

        s_cast = set(source.get("cast", []))
        c_cast = set(candidate.get("cast", []))
        shared_cast = list(s_cast.intersection(c_cast))
        cast_sim = min(1.0, len(shared_cast) * 0.5)

        # 4. Mood vector cosine similarity
        s_moods = source.get("mood_scores", {})
        c_moods = candidate.get("mood_scores", {})
        keys = ["chill", "energetic", "intense", "thoughtful", "feel_good"]
        dot = sum(s_moods.get(k, 0.5) * c_moods.get(k, 0.5) for k in keys)
        norm_s = math.sqrt(sum(s_moods.get(k, 0.5)**2 for k in keys))
        norm_c = math.sqrt(sum(c_moods.get(k, 0.5)**2 for k in keys))
        mood_cosine = dot / max(0.001, (norm_s * norm_c))

        # 5. Runtime proximity
        s_rt = source.get("runtime", 120)
        c_rt = candidate.get("runtime", 120)
        rt_diff = abs(s_rt - c_rt)
        rt_score = max(0.0, 1.0 - (rt_diff / 120.0))

        # Weighted aggregate score: Director auteur match is heavily valued in cinema
        similarity = (
            0.25 * director_match +
            0.25 * genre_jaccard +
            0.20 * theme_overlap +
            0.15 * mood_cosine +
            0.10 * cast_sim +
            0.05 * rt_score
        )
        sim_pct = round(similarity * 100, 1)

        # Build human-readable explanation
        reasons = []
        shared_directors = list(s_dir.intersection(c_dir))
        if shared_directors:
            reasons.append(f"Directed by {', '.join(shared_directors)}")

        shared_genres = list(s_genres.intersection(c_genres))
        if shared_genres:
            reasons.append(f"Shared genres: {', '.join(shared_genres)}")
        
        shared_theme_names = [t.replace('_', ' ') for t in s_themes.intersection(c_themes)]
        if shared_theme_names:
            reasons.append(f"Similar themes: {', '.join(shared_theme_names)}")

        if shared_cast:
            reasons.append(f"Shared cast: {', '.join(shared_cast)}")

        if rt_diff <= 15:
            reasons.append(f"Virtually identical length ({c_rt} min)")
        elif c_rt < s_rt:
            reasons.append(f"{s_rt - c_rt} minutes shorter than {source.get('title')}")
        else:
            reasons.append(f"{c_rt - s_rt} minutes longer epic")

        return {
            "similarity_percent": sim_pct,
            "reasons": reasons,
            "metrics": {
                "genre_jaccard": round(genre_jaccard, 3),
                "theme_overlap": round(theme_overlap, 3),
                "mood_cosine": round(mood_cosine, 3),
                "runtime_difference_mins": rt_diff
            }
        }

    def find_alternatives(
        self,
        source_movie_id: str,
        k: int = 5,
        max_runtime: Optional[int] = None
    ) -> Dict[str, Any]:
        source = self.movie_map.get(source_movie_id)
        if not source:
            return {"error": f"Source movie '{source_movie_id}' not found", "alternatives": []}

        scored = []
        for m in self.catalog:
            if m["id"] == source_movie_id:
                continue
            if max_runtime and m.get("runtime", 120) > max_runtime:
                continue

            sim_data = self.compute_similarity(source, m)
            scored.append({
                "movie": m,
                "similarity_percent": sim_data["similarity_percent"],
                "reasons": sim_data["reasons"],
                "metrics": sim_data["metrics"]
            })

        # Sort descending by similarity
        scored.sort(key=lambda item: item["similarity_percent"], reverse=True)
        top_k = scored[:k]

        return {
            "source_movie": source,
            "alternatives": top_k
        }
