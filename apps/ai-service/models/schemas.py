from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class RecommendationRequest(BaseModel):
    mood: float = Field(7.0, ge=1.0, le=10.0)
    time_budget_minutes: int = Field(180, ge=60, le=720)
    movie_count: int = Field(2, ge=1, le=6)
    genres: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    audience: str = "solo"
    exclude_tags: List[str] = Field(default_factory=list)
    exclude_violence: bool = False
    strategy: str = "astar" # 'astar', 'beam_search', 'csp'
    beam_width: int = 3
    user_genre_beliefs: Optional[Dict[str, Any]] = None

class RefinePlaylistRequest(BaseModel):
    current_playlist_ids: List[str]
    locked_movie_ids: List[str] = Field(default_factory=list)
    rejected_movie_ids: List[str] = Field(default_factory=list)
    target_genres: List[str] = Field(default_factory=list)
    mood: float = 7.0
    time_budget_minutes: int = 180
    algorithm: str = "simulated_annealing" # 'simulated_annealing', 'hill_climbing'

class WatchlistSequenceRequest(BaseModel):
    movie_ids: List[str]
    arc_strategy: str = "emotional_buildup" # 'emotional_buildup', 'release_chronology', 'variety_pacing'

class AlternativesRequest(BaseModel):
    movie_id: str
    k: int = 5
    max_runtime: Optional[int] = None

class CouchWarRequest(BaseModel):
    player1: Dict[str, Any]
    player2: Dict[str, Any]
    mode: str = "adversarial_minimax" # 'adversarial_minimax', 'collaborative_fairness'

class GroupFairnessRequest(BaseModel):
    participants: List[Dict[str, Any]]
    top_k: int = 3

class MarathonPlanRequest(BaseModel):
    start_time: str = "18:00"
    movie_count: int = 3
    preferred_genres: List[str] = Field(default_factory=list)
    mood: float = 7.0
    include_meal_break: bool = True
    meal_break_minutes: int = 40
    intermission_minutes: int = 15
    curfew_time: Optional[str] = "01:30"

class ReactiveReplanRequest(BaseModel):
    current_timeline: List[Dict[str, Any]]
    event_type: str # 'movie_skipped', 'time_curfew_shortened'
    event_payload: Dict[str, Any]

class ContentSafetyRequest(BaseModel):
    movie_id: str
    context: Dict[str, Any]

class PostWatchFeedbackRequest(BaseModel):
    movie_genres: List[str]
    enjoyment: int = Field(5, ge=1, le=5)
    recommendation_accuracy: int = Field(5, ge=1, le=5)
    mood_match: str = "Yes" # "Yes", "Partly", "No"
    reason_tags: List[str] = Field(default_factory=list)
    user_beliefs: Optional[Dict[str, Any]] = None

class NaturalLanguageGoalRequest(BaseModel):
    prompt: str
