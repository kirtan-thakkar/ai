"""
F-04. AI Movie Assistant Goal Parser
Intent & Entity Extraction for natural language movie viewing goals:
Parses prompts like:
"I have a rainy evening, two hours, watching with family. Suggest something light and funny without violence."
Extracts:
- mood slider (1-10)
- max_runtime_minutes
- audience ('solo', 'family', 'couple', 'friends')
- requested genres
- excluded tags / content safety flags
- strategy recommendation ('astar', 'beam_search', 'csp')
"""

import re
from typing import Dict, Any, List

class NaturalLanguageGoalParser:
    def __init__(self):
        self.genre_keywords = {
            "Sci-Fi": ["sci-fi", "science fiction", "space", "alien", "futuristic", "cyberpunk", "time travel"],
            "Action": ["action", "adrenaline", "fight", "explosive", "stunt", "chase", "combat"],
            "Thriller": ["thriller", "suspense", "edge-of-seat", "gripping", "dark", "mind-bending", "psychological"],
            "Comedy": ["comedy", "funny", "laugh", "humorous", "hilarious", "light", "breezy", "satire"],
            "Drama": ["drama", "emotional", "moving", "tearjerker", "deep", "character study"],
            "Animation": ["animation", "animated", "anime", "pixar", "ghibli", "cartoon"],
            "Horror": ["horror", "scary", "spooky", "creepy", "ghost", "frightening"],
            "Romance": ["romance", "romantic", "love story", "date night", "rom-com"],
            "Mystery": ["mystery", "whodunit", "detective", "clues", "investigation", "twist"],
            "Crime": ["crime", "gangster", "mafia", "heist", "cops"],
            "Family": ["family", "kids", "children", "wholesome", "all ages"],
            "Fantasy": ["fantasy", "magic", "mythic", "epic quest", "wizards"]
        }

        self.audience_keywords = {
            "family": ["family", "kids", "children", "parents", "relatives"],
            "couple": ["date night", "partner", "couple", "girlfriend", "boyfriend", "wife", "husband"],
            "friends": ["friends", "roommates", "party", "buddies", "boys night", "girls night"],
            "solo": ["alone", "solo", "myself", "quiet evening"]
        }

        self.exclusion_keywords = {
            "violence": ["no violence", "without violence", "avoid gore", "not violent", "no blood"],
            "horror": ["no horror", "not scary", "avoid jumpscares"],
            "adult_content": ["no adult content", "clean", "safe for kids", "no nudity", "no sex"]
        }

    def parse_goal(self, text: str) -> Dict[str, Any]:
        t = text.lower()
        
        # 1. Parse Duration / Runtime
        max_runtime = 150 # default
        time_match = re.search(r'(\d+)\s*(?:hours?|hrs?|h)\b', t)
        min_match = re.search(r'(\d+)\s*(?:minutes?|mins?|m)\b', t)
        
        if time_match:
            hours = int(time_match.group(1))
            mins = int(min_match.group(1)) if min_match else 0
            max_runtime = hours * 60 + mins
        elif min_match:
            max_runtime = int(min_match.group(1))
        elif "two hours" in t:
            max_runtime = 120
        elif "one hour" in t:
            max_runtime = 90
        elif "quick" in t or "short" in t:
            max_runtime = 100

        # 2. Parse Audience
        audience = "solo"
        for aud, kws in self.audience_keywords.items():
            if any(kw in t for kw in kws):
                audience = aud
                break

        # 3. Parse Genres
        detected_genres = []
        for g_name, kws in self.genre_keywords.items():
            if any(kw in t for kw in kws):
                detected_genres.append(g_name)

        # 4. Parse Mood (1 to 10)
        mood = 6.0
        if any(w in t for w in ["intense", "mind-bending", "dark", "gripping", "edge of seat"]):
            mood = 9.0
        elif any(w in t for w in ["action", "adrenaline", "energetic", "hype", "exciting"]):
            mood = 8.0
        elif any(w in t for w in ["rainy", "cozy", "relax", "chill", "calm", "gentle", "lazy"]):
            mood = 2.5
        elif any(w in t for w in ["light", "funny", "wholesome", "feel-good", "sweet"]):
            mood = 3.5
        elif any(w in t for w in ["deep", "thoughtful", "philosophical"]):
            mood = 7.0

        # 5. Parse Exclusions
        exclusions = []
        for exc, kws in self.exclusion_keywords.items():
            if any(kw in t for kw in kws):
                exclusions.append(exc)

        # 6. Audience-derived exclusions
        if audience == "family" and "adult_content" not in exclusions:
            exclusions.append("adult_content")

        return {
            "original_prompt": text,
            "parsed_constraints": {
                "mood": mood,
                "max_runtime_minutes": max_runtime,
                "audience": audience,
                "genres": detected_genres if detected_genres else ["Comedy", "Adventure"],
                "exclusions": exclusions,
                "target_movie_count": 2 if max_runtime >= 180 else 1
            },
            "interpretation_summary": (
                f"Understood request as: Mood {mood}/10, budget <= {max_runtime} mins, audience: {audience.title()}, "
                f"preferred genres: {detected_genres if detected_genres else ['General Popular']}, "
                f"exclusions: {exclusions if exclusions else ['None']}."
            )
        }
