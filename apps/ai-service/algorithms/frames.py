"""
F-16. Frame-Based Movie Inheritance
Knowledge representation using hierarchical frames, slots, default values, and inheritance.
Tracks provenance for every slot to distinguish verified movie facts from inherited defaults.
"""

from typing import Dict, Any, List, Optional
import json
import os

class FrameKnowledgeEngine:
    def __init__(self, frames_filepath: Optional[str] = None):
        if frames_filepath and os.path.exists(frames_filepath):
            with open(frames_filepath, "r", encoding="utf-8") as f:
                self.frames = json.load(f)
        else:
            default_path = os.path.join(os.path.dirname(__file__), "..", "data", "frames.json")
            if os.path.exists(default_path):
                with open(default_path, "r", encoding="utf-8") as f:
                    self.frames = json.load(f)
            else:
                self.frames = {}

    def get_frame(self, frame_id: str) -> Optional[Dict[str, Any]]:
        return self.frames.get(frame_id)

    def get_inheritance_chain(self, frame_id: str) -> List[str]:
        """Returns ordered chain from root frame to target frame."""
        chain = []
        curr = frame_id
        visited = set()
        while curr and curr in self.frames and curr not in visited:
            visited.add(curr)
            chain.append(curr)
            curr = self.frames[curr].get("parent")
        chain.reverse()
        return chain

    def resolve_movie_slots(self, movie: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merges inherited frame slots with verified movie-specific overrides,
        annotating provenance for every single attribute.
        """
        frame_type = movie.get("frame_type", "GeneralFilm")
        if frame_type not in self.frames:
            frame_type = "GeneralFilm"

        chain = self.get_inheritance_chain(frame_type)
        
        resolved_slots = {}
        provenance = {}

        # 1. Traverse inheritance chain from root to child
        for f_id in chain:
            frame_def = self.frames.get(f_id, {})
            slots = frame_def.get("slots", {})
            for k, val in slots.items():
                resolved_slots[k] = val
                provenance[k] = f"inherited_from_{f_id}"

        # 2. Apply title-specific verified overrides
        verified_overrides = {
            "title": movie.get("title"),
            "release_year": movie.get("release_year"),
            "runtime": movie.get("runtime"),
            "language": movie.get("language"),
            "age_rating": movie.get("age_rating"),
            "violence_level": movie.get("violence_level"),
            "directors": movie.get("directors"),
            "cast": movie.get("cast"),
            "franchise": movie.get("franchise"),
            "genres": movie.get("genres"),
            "themes": movie.get("themes"),
            "imdb_rating": movie.get("imdb_rating")
        }

        for k, val in verified_overrides.items():
            if val is not None:
                resolved_slots[k] = val
                provenance[k] = "verified_title_specific"

        return {
            "frame_type": frame_type,
            "inheritance_chain": chain,
            "resolved_slots": resolved_slots,
            "provenance": provenance
        }
