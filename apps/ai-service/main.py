"""
Python FastAPI AI Service for Intelligent Movie Discovery & Planning
Implements all syllabus algorithms:
- A* Search for multi-movie playlist optimization
- CSP Backtracking with Forward Checking
- Beam Search with configurable width k
- Hill Climbing & Simulated Annealing (Playlist Refinement)
- Greedy Best-First Watchlist Sequencer
- Heuristic Nearest-Neighbor (Alternative Movie Finder)
- 2-Player Adversarial Minimax with Alpha-Beta Pruning
- Multi-User Max-Min Group Fairness & Nash Social Welfare
- Conjugate Beta-Binomial Bayesian Taste Updating
- Fuzzy Logic Mood Detection & Membership Functions
- Frame-Based Movie Knowledge Representation & Inheritance
- Movie Knowledge Graph Semantic Traversal & Path Explanation
- Goal Stack Planning for Movie Marathon Planning
- Forward-Chaining Rule-Based Expert System for Content Safety
- Dynamic Reactive Replanning on Drop-off / Curfew Shifts
- Calibrated Recommendation Confidence Meter
"""

import os
import json
import uuid
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    RecommendationRequest,
    RefinePlaylistRequest,
    WatchlistSequenceRequest,
    AlternativesRequest,
    CouchWarRequest,
    GroupFairnessRequest,
    MarathonPlanRequest,
    ReactiveReplanRequest,
    ContentSafetyRequest,
    PostWatchFeedbackRequest,
    NaturalLanguageGoalRequest
)

from algorithms.fuzzy import FuzzyMoodEngine
from algorithms.bayesian import BayesianTasteModel
from algorithms.frames import FrameKnowledgeEngine
from algorithms.knowledge_graph import MovieKnowledgeGraph
from algorithms.astar import AStarRecommender
from algorithms.csp import CSPPlaylistSolver
from algorithms.beam_search import BeamSearchPlaylistPlanner
from algorithms.local_search import PlaylistLocalSearchOptimizer
from algorithms.sequencer import WatchlistSequencer
from algorithms.alternatives import AlternativeMovieFinder
from algorithms.minimax import CouchWarEngine
from algorithms.expert_system import ContentSafetyExpertSystem
from algorithms.planning import MarathonPlanner
from algorithms.reactive import ReactiveReplanningEngine
from algorithms.confidence import ConfidenceMeter
from algorithms.natural_language_parser import NaturalLanguageGoalParser
from algorithms.live_api import LiveMovieAPI

app = FastAPI(
    title="Intelligent Movie Discovery & Planning AI Engine",
    description="FAI Syllabus-Aligned Academic AI Recommendation & Planning Service",
    version="1.0.0"
)

# Enable CORS for frontend and API gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Initialize Data & Engines
# -------------------------------------------------------------
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MOVIES_FILE = os.path.join(DATA_DIR, "movies.json")
FRAMES_FILE = os.path.join(DATA_DIR, "frames.json")
TAXONOMIES_FILE = os.path.join(DATA_DIR, "taxonomies.json")

with open(MOVIES_FILE, "r", encoding="utf-8") as f:
    ALL_MOVIES = json.load(f)

with open(TAXONOMIES_FILE, "r", encoding="utf-8") as f:
    TAXONOMIES = json.load(f)

MOVIE_MAP = {m["id"]: m for m in ALL_MOVIES}

# Instantiate Engines
fuzzy_engine = FuzzyMoodEngine()
bayesian_model = BayesianTasteModel()
frames_engine = FrameKnowledgeEngine(FRAMES_FILE)
knowledge_graph = MovieKnowledgeGraph(ALL_MOVIES)
astar_recommender = AStarRecommender(ALL_MOVIES)
csp_solver = CSPPlaylistSolver(ALL_MOVIES)
beam_planner = BeamSearchPlaylistPlanner(ALL_MOVIES)
local_search_optimizer = PlaylistLocalSearchOptimizer(ALL_MOVIES)
sequencer = WatchlistSequencer(MOVIE_MAP)
alternatives_finder = AlternativeMovieFinder(ALL_MOVIES)
couch_war_engine = CouchWarEngine(ALL_MOVIES)
safety_expert_system = ContentSafetyExpertSystem()
marathon_planner = MarathonPlanner(ALL_MOVIES)
reactive_replanner = ReactiveReplanningEngine(ALL_MOVIES)
confidence_meter = ConfidenceMeter()
nl_parser = NaturalLanguageGoalParser()

# -------------------------------------------------------------
# General & Catalogue Endpoints
# -------------------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-engine",
        "version": "1.0.0",
        "movies_loaded": len(ALL_MOVIES),
        "graph_nodes": len(knowledge_graph.nodes),
        "graph_edges": len(knowledge_graph.edges),
        "frames_loaded": len(frames_engine.frames)
    }

@app.get("/movies/live")
def search_live_movies(q: str = Query(..., description="Query for free online cinema API"), limit: int = 10):
    live_items = LiveMovieAPI.search_live_movies(q, limit=limit)
    return {"query": q, "count": len(live_items), "movies": live_items}

@app.get("/movies")
def list_movies(
    genre: Optional[str] = None,
    language: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    results = ALL_MOVIES
    if genre:
        results = [m for m in results if genre.lower() in [g.lower() for g in m.get("genres", [])]]
    if language:
        results = [m for m in results if m.get("language") == language]
    if search:
        s = search.lower()
        matched = [
            m for m in results 
            if s in m.get("title", "").lower() 
            or any(s in d.lower() for d in m.get("directors", []))
            or any(s in c.lower() for c in m.get("cast", []))
        ]
        # Query free live internet movie API to supplement results dynamically
        live_matches = LiveMovieAPI.search_live_movies(search, limit=6)
        for lm in live_matches:
            MOVIE_MAP[lm["id"]] = lm
        results = matched + [lm for lm in live_matches if lm["id"] not in [m["id"] for m in matched]]
    
    total = len(results)
    paginated = results[offset : offset + limit]
    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "movies": paginated
    }

@app.get("/movies/{movie_id}")
def get_movie_detail(movie_id: str):
    movie = MOVIE_MAP.get(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    # Enrich with resolved frame attributes
    frame_data = frames_engine.resolve_movie_slots(movie)
    # Get 1-hop knowledge graph connections
    graph_data = knowledge_graph.get_related_subgraph(movie_id, hops=1)

    return {
        "movie": movie,
        "frame_representation": frame_data,
        "graph_connections": graph_data
    }

@app.get("/taxonomies")
def get_taxonomies():
    return TAXONOMIES

# -------------------------------------------------------------
# F-04. Natural Language Goal Assistant
# -------------------------------------------------------------
@app.post("/assistant/parse-goal")
def parse_natural_language_goal(req: NaturalLanguageGoalRequest):
    return nl_parser.parse_goal(req.prompt)

# -------------------------------------------------------------
# F-06 / F-07 / F-08 / F-14. Main Recommendation Pipeline
# -------------------------------------------------------------
@app.post("/recommendations/search")
def search_recommendations(req: RecommendationRequest):
    # Step 1: Evaluate Fuzzy Mood
    fuzzy_data = fuzzy_engine.evaluate_slider(req.mood)
    dominant_mood = max(fuzzy_data.items(), key=lambda i: i[1])[0]

    # Step 2: Candidate Retrieval & Hard Filters
    candidates = list(ALL_MOVIES)
    if req.languages:
        candidates = [m for m in candidates if m.get("language") in req.languages]

    # Step 3: Run Safety Expert System to filter out prohibited content
    safety_context = {
        "audience": req.audience,
        "exclude_violence": req.exclude_violence,
        "exclude_tags": req.exclude_tags,
        "max_age": 12 if req.audience == "child" else (15 if req.audience == "family" else 18)
    }
    
    filtered_candidates = []
    safety_audits = {}
    for m in candidates:
        audit = safety_expert_system.evaluate_movie_safety(m, safety_context)
        safety_audits[m["id"]] = audit
        if audit["is_safe"]:
            filtered_candidates.append(m)

    if not filtered_candidates:
        filtered_candidates = candidates[:10] # Safety fallback if filters too restrictive

    # Step 4: Execute Selected AI Search Algorithm
    strategy = req.strategy.lower()
    search_metrics = {}
    selected_movies = []

    if strategy == "beam_search":
        planner = BeamSearchPlaylistPlanner(filtered_candidates)
        res = planner.search(
            target_count=req.movie_count,
            time_budget_minutes=req.time_budget_minutes,
            target_genres=req.genres,
            user_fuzzy_degrees=fuzzy_data,
            beam_width=req.beam_width
        )
        selected_movies = res.get("solution", [])
        search_metrics = res.get("metrics", {})

    elif strategy == "csp":
        solver = CSPPlaylistSolver(filtered_candidates)
        res = solver.solve(
            slot_count=req.movie_count,
            time_budget_minutes=req.time_budget_minutes,
            break_duration_minutes=0,
            max_age_rating="PG" if req.audience in ["child", "family"] else None,
            required_genres=req.genres
        )
        selected_movies = res.get("solution", [])
        search_metrics = res.get("metrics", {})

        if not selected_movies:
            recommender = AStarRecommender(filtered_candidates)
            astar_res = recommender.search_playlist(
                target_count=req.movie_count,
                time_budget_minutes=int(req.time_budget_minutes * 1.3),
                target_genres=req.genres,
                user_fuzzy_degrees=fuzzy_data,
                mood_slider=req.mood,
                candidate_pool=filtered_candidates
            )
            selected_movies = astar_res.get("movies", [])
            search_metrics = astar_res.get("metrics", {})
            search_metrics["fallback_triggered"] = True

    else: # Default: 'astar'
        recommender = AStarRecommender(filtered_candidates)
        res = recommender.search_playlist(
            target_count=req.movie_count,
            time_budget_minutes=req.time_budget_minutes,
            target_genres=req.genres,
            user_fuzzy_degrees=fuzzy_data,
            mood_slider=req.mood,
            candidate_pool=filtered_candidates
        )
        selected_movies = res.get("movies", [])
        search_metrics = res.get("metrics", {})

    # Final guarantee: never leave user with an empty recommendation list
    if not selected_movies and filtered_candidates:
        selected_movies = filtered_candidates[:req.movie_count]
        search_metrics["fallback_applied"] = True

    # Step 5: Post-Processing & Calibrated Confidence Meter
    results = []
    beliefs = req.user_genre_beliefs or {}
    
    for rank, m in enumerate(selected_movies, start=1):
        conf = confidence_meter.compute_movie_confidence(
            movie=m,
            target_genres=req.genres,
            user_fuzzy_degrees=fuzzy_data,
            user_genre_beliefs=beliefs,
            target_runtime_budget=req.time_budget_minutes // max(1, req.movie_count)
        )
        
        # Explainable reasons
        reasons = list(conf["supporting_factors"])
        if m.get("id") in safety_audits and safety_audits[m["id"]]["advisories"]:
            reasons.extend(safety_audits[m["id"]]["advisories"])

        results.append({
            "movieId": m["id"],
            "title": m["title"],
            "releaseYear": m.get("release_year"),
            "runtimeMinutes": m.get("runtime"),
            "genres": m.get("genres", []),
            "directors": m.get("directors", []),
            "cast": m.get("cast", []),
            "imdbRating": m.get("imdb_rating"),
            "posterUrl": m.get("poster_url"),
            "overview": m.get("overview"),
            "rank": rank,
            "matchScore": conf["match_score"],
            "scoreLabel": conf["score_label"],
            "confidenceLevel": conf["confidence_level"],
            "scoreBreakdown": conf["score_breakdown"],
            "reasons": reasons,
            "uncertaintyFactors": conf["uncertainty_factors"]
        })

    session_id = f"sess_{uuid.uuid4().hex[:12]}"

    return {
        "sessionId": session_id,
        "modelVersion": "recommender-1.0.0-fai",
        "strategy": strategy,
        "dominantMood": dominant_mood,
        "fuzzyDegrees": fuzzy_data,
        "results": results,
        "searchMetrics": search_metrics
    }

# -------------------------------------------------------------
# F-11. Playlist Shuffler – Refine My List (Local Search)
# -------------------------------------------------------------
@app.post("/recommendations/refine")
def refine_playlist(req: RefinePlaylistRequest):
    fuzzy_data = fuzzy_engine.evaluate_slider(req.mood)
    res = local_search_optimizer.refine_playlist(
        current_playlist_ids=req.current_playlist_ids,
        locked_movie_ids=req.locked_movie_ids,
        rejected_movie_ids=req.rejected_movie_ids,
        target_genres=req.target_genres,
        user_fuzzy_degrees=fuzzy_data,
        time_budget_minutes=req.time_budget_minutes,
        algorithm=req.algorithm
    )
    return res

# -------------------------------------------------------------
# F-09. Watchlist Sequencer
# -------------------------------------------------------------
@app.post("/recommendations/sequence")
def sequence_watchlist(req: WatchlistSequenceRequest):
    movies = [MOVIE_MAP[mid] for mid in req.movie_ids if mid in MOVIE_MAP]
    return sequencer.sequence_watchlist(movies, arc_strategy=req.arc_strategy)

# -------------------------------------------------------------
# F-10. Alternative Movie Finder (k-NN)
# -------------------------------------------------------------
@app.get("/movies/{movie_id}/alternatives")
def get_movie_alternatives(
    movie_id: str,
    k: int = 5,
    max_runtime: Optional[int] = None
):
    return alternatives_finder.find_alternatives(movie_id, k=k, max_runtime=max_runtime)

# -------------------------------------------------------------
# F-12. Couch War & Group Recommendations
# -------------------------------------------------------------
@app.post("/couch-war/minimax")
def run_minimax_couch_war(req: CouchWarRequest):
    return couch_war_engine.run_minimax_demonstration(
        player1_prefs=req.player1,
        player2_prefs=req.player2,
        max_depth=3
    )

@app.post("/couch-war/fairness")
def run_group_fairness(req: GroupFairnessRequest):
    return couch_war_engine.recommend_for_group(
        participants=req.participants,
        top_k=req.top_k
    )

# -------------------------------------------------------------
# F-18. Automated Movie Marathon Planner
# -------------------------------------------------------------
@app.post("/planning/marathon")
def plan_movie_marathon(req: MarathonPlanRequest):
    return marathon_planner.generate_marathon_plan(
        start_time_str=req.start_time,
        movie_count=req.movie_count,
        preferred_genres=req.preferred_genres,
        mood_slider=req.mood,
        include_meal_break=req.include_meal_break,
        meal_break_minutes=req.meal_break_minutes,
        intermission_minutes=req.intermission_minutes,
        curfew_time_str=req.curfew_time
    )

# -------------------------------------------------------------
# F-21. Dynamic Reactive Replanning on Drop-off
# -------------------------------------------------------------
@app.post("/planning/replan")
def reactive_replan(req: ReactiveReplanRequest):
    return reactive_replanner.replan_marathon(
        current_timeline=req.current_timeline,
        event_type=req.event_type,
        event_payload=req.event_payload
    )

# -------------------------------------------------------------
# F-19. Content Safety Advisor
# -------------------------------------------------------------
@app.post("/safety/evaluate")
def evaluate_movie_safety(req: ContentSafetyRequest):
    movie = MOVIE_MAP.get(req.movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return safety_expert_system.evaluate_movie_safety(movie, req.context)

# -------------------------------------------------------------
# F-13 & F-22. Post-Watch Review & Bayesian Learning Loop
# -------------------------------------------------------------
@app.post("/feedback/bayesian-update")
def process_bayesian_feedback(req: PostWatchFeedbackRequest):
    current_beliefs = req.user_beliefs or {}
    res = bayesian_model.process_post_watch_feedback(
        user_beliefs=current_beliefs,
        movie_genres=req.movie_genres,
        enjoyment=req.enjoyment,
        recommendation_accuracy=req.recommendation_accuracy,
        mood_match=req.mood_match,
        reason_tags=req.reason_tags
    )
    return {
        "updated_user_beliefs": current_beliefs,
        "diagnostic_trace": res
    }

# -------------------------------------------------------------
# F-15. Knowledge Graph Traversal & Explanation
# -------------------------------------------------------------
@app.get("/knowledge-graph/explore/{movie_id}")
def explore_graph(movie_id: str, hops: int = 1):
    return knowledge_graph.get_related_subgraph(movie_id, hops=hops)

@app.get("/knowledge-graph/path/{movie_a}/{movie_b}")
def explain_graph_path(movie_a: str, movie_b: str):
    path = knowledge_graph.find_explanation_path(movie_a, movie_b)
    return {
        "movie_a": movie_a,
        "movie_b": movie_b,
        "path_length": len(path),
        "explanation_path": path
    }

# -------------------------------------------------------------
# F-16. Frame Knowledge Representation Inspector
# -------------------------------------------------------------
@app.get("/frames/explore/{frame_id}")
def explore_frame(frame_id: str):
    frame = frames_engine.get_frame(frame_id)
    if not frame:
        raise HTTPException(status_code=404, detail="Frame not found")
    chain = frames_engine.get_inheritance_chain(frame_id)
    return {
        "frame_id": frame_id,
        "frame": frame,
        "inheritance_chain": chain,
        "all_available_frames": list(frames_engine.frames.keys())
    }

# -------------------------------------------------------------
# Academic Viva & Algorithm Playground Diagnostics
# -------------------------------------------------------------
@app.get("/viva/diagnostics")
def get_viva_diagnostics():
    return {
        "course": "Foundations of Artificial Intelligence (FAI)",
        "project": "Intelligent Movie Discovery & Planning Agent",
        "version": "1.0.0",
        "algorithms_implemented": [
            {"code": "F-06", "name": "A* Search", "description": "Playlist state space search with f(n)=g(n)+h(n) and mood lambda scaling", "status": "Ready"},
            {"code": "F-07", "name": "CSP Backtracking + Forward Checking", "description": "Prunes future candidate domains on runtime budget & content constraints", "status": "Ready"},
            {"code": "F-08", "name": "Beam Search Memory Saver", "description": "Configurable beam width k bounding memory footprint across large catalogues", "status": "Ready"},
            {"code": "F-09", "name": "Greedy Best-First Sequencer", "description": "Emotional build-up, release chronology, and variety pacing arcs", "status": "Ready"},
            {"code": "F-10", "name": "Alternative Movie Finder (k-NN)", "description": "Multi-attribute cosine & Jaccard distance with explainable differences", "status": "Ready"},
            {"code": "F-11", "name": "Local Search (Simulated Annealing & Hill Climbing)", "description": "Playlist shuffler and repair with cooling schedule", "status": "Ready"},
            {"code": "F-12", "name": "Minimax + Alpha-Beta & Collaborative Fairness", "description": "2-Player adversarial cutoffs demo + Max-Min group fairness", "status": "Ready"},
            {"code": "F-13", "name": "Bayesian Taste Updating", "description": "Conjugate Beta-Binomial prior/posterior distribution for preference beliefs", "status": "Ready"},
            {"code": "F-14", "name": "Confidence Meter", "description": "Calibrated match score with supporting factor and uncertainty breakdown", "status": "Ready"},
            {"code": "F-15", "name": "Movie Knowledge Graph", "description": "Semantic network entities & typed relations with multi-hop BFS path explanation", "status": "Ready"},
            {"code": "F-16", "name": "Frame-Based Inheritance", "description": "Hierarchical frames with slot defaults, title overrides, and provenance tracking", "status": "Ready"},
            {"code": "F-17", "name": "Fuzzy Mood Detection", "description": "Triangular & trapezoidal membership functions mapping slider to soft sets", "status": "Ready"},
            {"code": "F-18", "name": "Goal Stack & Non-linear Planning", "description": "Automated movie marathon scheduler with subgoals and timeline", "status": "Ready"},
            {"code": "F-19", "name": "Rule-Based Expert System", "description": "Forward-chaining inference engine for content safety and parental rules", "status": "Ready"},
            {"code": "F-21", "name": "Dynamic Reactive Replanning", "description": "Reactive repair when titles are skipped or time shifts without rebuilding history", "status": "Ready"},
            {"code": "F-22", "name": "Post-Watch Feedback Loop", "description": "Distinguishes movie enjoyment from recommendation accuracy", "status": "Ready"}
        ]
    }
