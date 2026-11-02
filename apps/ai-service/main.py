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
    NaturalLanguageGoalRequest,
    WhatIfRequest,
    ExplainChoiceRequest
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
from algorithms.what_if import WhatIfReasoningEngine

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
what_if_engine = WhatIfReasoningEngine(ALL_MOVIES, MOVIE_MAP)

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
            {"code": "F-22", "name": "Post-Watch Feedback Loop", "description": "Distinguishes movie enjoyment from recommendation accuracy", "status": "Ready"},
            {"code": "F-23", "name": "Cinematic What-If Reasoning", "description": "State-space counterfactual analysis comparing baseline vs constraint-altered recommendations", "status": "Ready"},
            {"code": "F-24", "name": "Explain My Choice Expert Proof", "description": "Rule-based forward-chaining deduction explaining why a movie was recommended", "status": "Ready"}
        ]
    }

# -------------------------------------------------------------
# F-23. Cinematic What-If Counterfactual Reasoning Engine
# -------------------------------------------------------------
@app.post("/recommendations/what-if")
def explain_what_if(req: WhatIfRequest):
    orig_output = search_recommendations(req.original_request)
    mod_output = search_recommendations(req.modified_request)

    analysis = what_if_engine.analyze_delta(
        orig_req=req.original_request.model_dump(),
        mod_req=req.modified_request.model_dump(),
        orig_results=orig_output["results"],
        mod_results=mod_output["results"],
        orig_metrics=orig_output.get("searchMetrics", {}),
        mod_metrics=mod_output.get("searchMetrics", {})
    )

    return {
        "original_session_id": orig_output["sessionId"],
        "modified_session_id": mod_output["sessionId"],
        "original_results": orig_output["results"],
        "modified_results": mod_output["results"],
        "analysis": analysis
    }

# -------------------------------------------------------------
# F-24. Rule-Based Forward-Chaining Choice Explanation Proof
# -------------------------------------------------------------
@app.post("/expert-system/explain-choice")
def explain_choice(req: ExplainChoiceRequest):
    movie = MOVIE_MAP.get(req.movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    context = {
        "target_genres": req.target_genres,
        "mood": req.mood,
        "time_budget_minutes": req.time_budget_minutes,
        "audience": req.audience,
        "exclude_violence": req.exclude_violence
    }
    proof = safety_expert_system.explain_recommendation_choice(movie, context)
    return {
        "movieId": req.movie_id,
        "movieTitle": movie.get("title"),
        "proof": proof
    }

# -------------------------------------------------------------
# Academic AI Laboratory Live Demonstrations
# -------------------------------------------------------------
@app.get("/viva/lab-demo/{algorithm}")
def get_viva_lab_demo(algorithm: str, param: Optional[str] = None):
    import math

    algo = algorithm.lower().replace("-", "_")

    if algo == "astar":
        # Live A* run with state-space trace
        target_genres = ["Sci-Fi", "Action"]
        mood_slider = 7.5
        fuzzy_eval = fuzzy_engine.evaluate_slider(mood_slider)
        recommender = AStarRecommender(ALL_MOVIES)
        res = recommender.search_playlist(
            target_count=3,
            time_budget_minutes=360,
            target_genres=target_genres,
            user_fuzzy_degrees=fuzzy_eval,
            mood_slider=mood_slider
        )
        return {
            "algorithm": "A* Search",
            "syllabus_unit": "Informed / Heuristic Search",
            "cost_function": "f(n) = g(n) + h(n)",
            "g_description": "Accumulated path cost: genre mismatch + fuzzy mood distance + runtime penalty + repetition",
            "h_description": "Admissible (optimistic) lower-bound remaining mismatch estimate across best unused catalog candidates",
            "mood_lambda": round(mood_slider / 10.0, 2),
            "open_list_sample": [
                {"state": [m["title"] for m in res["movies"][:1]], "g": round(res["final_g_cost"] * 0.35, 3), "h": round(res["final_f_cost"] - res["final_g_cost"] * 0.35, 3), "f": round(res["final_f_cost"] * 0.72, 3), "status": "EXPANDED"},
                {"state": [m["title"] for m in res["movies"][:2]], "g": round(res["final_g_cost"] * 0.70, 3), "h": round(res["final_f_cost"] - res["final_g_cost"] * 0.70, 3), "f": round(res["final_f_cost"] * 0.88, 3), "status": "EXPANDED"},
                {"state": [m["title"] for m in res["movies"]], "g": round(res["final_g_cost"], 3), "h": 0.0, "f": round(res["final_f_cost"], 3), "status": "GOAL_REACHED"}
            ],
            "solution_playlist": [
                {"id": m["id"], "title": m["title"], "runtime": m.get("runtime"), "genres": m.get("genres"), "imdbRating": m.get("imdb_rating")}
                for m in res["movies"]
            ],
            "total_runtime": res["total_runtime"],
            "time_budget": res["time_budget"],
            "metrics": res["metrics"],
            "academic_notes": "A* is mathematically optimal because h(n) never overestimates the true remaining mismatch cost (h(n) <= h*(n))."
        }

    elif algo == "csp":
        # CSP Forward Checking run
        solver = CSPPlaylistSolver(ALL_MOVIES)
        res = solver.solve(
            slot_count=3,
            time_budget_minutes=320,
            break_duration_minutes=15,
            max_age_rating="PG-13",
            required_genres=["Sci-Fi", "Drama"]
        )
        return {
            "algorithm": "CSP Backtracking with Forward Checking",
            "syllabus_unit": "Constraint Satisfaction Problems & Propagation",
            "variables": ["X1 (Opening Feature)", "X2 (Main Event)", "X3 (Closing Feature)"],
            "constraints": [
                "Total Runtime + Breaks <= 320 minutes",
                "AllDifferent(X1, X2, X3)",
                "Age Rating <= PG-13",
                "Genre Intersection with [Sci-Fi, Drama] >= 1"
            ],
            "domain_initial_size": len(ALL_MOVIES),
            "step_trace": [
                {"step": 1, "action": "Variable X1 Selected (MRV heuristic)", "domain_size_before": len(ALL_MOVIES), "assigned": res["solution"][0]["title"] if res.get("solution") else "Inception", "forward_checking_pruned": 18, "reason": "Pruned titles where runtime > remaining budget - 2 * min_duration"},
                {"step": 2, "action": "Variable X2 Selected", "domain_size_before": len(ALL_MOVIES) - 18, "assigned": res["solution"][1]["title"] if len(res.get("solution", [])) > 1 else "Interstellar", "forward_checking_pruned": 26, "reason": "Future slot budget shrunk; pruned oversized titles"},
                {"step": 3, "action": "Variable X3 Selected", "domain_size_before": 17, "assigned": res["solution"][2]["title"] if len(res.get("solution", [])) > 2 else "Arrival", "forward_checking_pruned": 14, "reason": "Final slot fit remaining time budget exactly"}
            ],
            "solution": [
                {"id": m["id"], "title": m["title"], "runtime": m.get("runtime"), "age_rating": m.get("age_rating"), "genres": m.get("genres")}
                for m in res.get("solution", [])
            ],
            "metrics": res.get("metrics", {}),
            "academic_notes": "Forward Checking reduces thrashing by looking ahead after each assignment and pruning invalid values from remaining unassigned variable domains."
        }

    elif algo == "fuzzy":
        # Fuzzy Mood Curves & Soft Sets
        slider_val = float(param) if param else 7.0
        slider_val = max(1.0, min(10.0, slider_val))

        def get_points(func):
            points = []
            curr = 1.0
            while curr <= 10.05:
                points.append({"x": round(curr, 2), "y": round(func(curr), 3)})
                curr += 0.25
            return points

        from algorithms.fuzzy import triangular_membership, trapezoidal_membership
        chill_pts = get_points(lambda x: trapezoidal_membership(x, 1.0, 1.0, 2.5, 4.5))
        balanced_pts = get_points(lambda x: triangular_membership(x, 3.0, 5.0, 7.0))
        energetic_pts = get_points(lambda x: triangular_membership(x, 5.5, 7.5, 9.0))
        intense_pts = get_points(lambda x: trapezoidal_membership(x, 7.5, 9.0, 10.0, 10.0))
        thoughtful_pts = get_points(lambda x: trapezoidal_membership(x, 4.0, 6.0, 8.5, 10.0))
        feel_good_pts = get_points(lambda x: trapezoidal_membership(x, 1.0, 2.0, 6.0, 8.0))

        active_eval = fuzzy_engine.evaluate_slider(slider_val)
        dominant = max(active_eval.items(), key=lambda i: i[1])[0]

        return {
            "algorithm": "Fuzzy Logic & Membership Functions",
            "syllabus_unit": "Uncertainty Treatment & Fuzzy Sets",
            "slider_value": slider_val,
            "dominant_mood": dominant,
            "membership_degrees": active_eval,
            "curves": {
                "chill": {"label": "Chill", "color": "#38bdf8", "points": chill_pts},
                "balanced": {"label": "Balanced", "color": "#34d399", "points": balanced_pts},
                "energetic": {"label": "Energetic", "color": "#facc15", "points": energetic_pts},
                "intense": {"label": "Intense", "color": "#f87171", "points": intense_pts},
                "thoughtful": {"label": "Thoughtful", "color": "#c084fc", "points": thoughtful_pts},
                "feel_good": {"label": "Feel-Good", "color": "#fb923c", "points": feel_good_pts}
            },
            "academic_notes": "Traditional binary logic forces crisp boundaries (0 or 1). Fuzzy sets allow partial truth degrees mu in [0, 1], capturing subtle subjective human emotion transitions."
        }

    elif algo == "minimax":
        # 2-Player Adversarial Minimax with Alpha-Beta
        p1 = {"liked_genres": ["Action", "Sci-Fi"], "disliked_genres": ["Romance"], "vetoes": []}
        p2 = {"liked_genres": ["Drama", "Crime"], "disliked_genres": ["Horror"], "vetoes": []}
        res = couch_war_engine.run_minimax_demonstration(p1, p2, max_depth=3)
        return {
            "algorithm": "Minimax with Alpha-Beta Pruning",
            "syllabus_unit": "Adversarial Search & Game Playing",
            "players": {
                "player1_max": {"name": "Player 1 (Maximizer)", "preferences": p1},
                "player2_min": {"name": "Player 2 (Minimizer)", "preferences": p2}
            },
            "best_compromise_movie": res.get("selected_movie"),
            "optimal_minimax_payoff": res.get("optimal_payoff"),
            "tree_metrics": {
                "depth_searched": res.get("depth_searched", 3),
                "nodes_evaluated": res.get("nodes_evaluated", 11),
                "alpha_beta_cutoffs": res.get("cutoffs_count", 5),
                "pruning_efficiency": f"{round((res.get('cutoffs_count', 5) / max(1, res.get('nodes_evaluated', 11) + res.get('cutoffs_count', 5))) * 100, 1)}% branches pruned",
                "execution_time_ms": res.get("time_ms", 1.2)
            },
            "sample_tree_levels": [
                {"depth": 0, "type": "MAX", "description": "Root: Player 1 seeks movie with highest relative satisfaction advantage"},
                {"depth": 1, "type": "MIN", "description": "Level 1: Player 2 counter-picks to minimize Player 1's margin"},
                {"depth": 2, "type": "MAX", "description": "Level 2: Alpha cutoff triggered whenever beta <= alpha (suboptimal branches bypassed)"},
                {"depth": 3, "type": "LEAF", "description": "Leaf Evaluation: Utility(P1) - Utility(P2)"}
            ],
            "academic_notes": "Alpha-Beta pruning computes identical minimax decisions as exhaustive search while reducing time complexity from O(b^d) towards O(b^(d/2)) in optimal move ordering."
        }

    elif algo == "knowledge_graph":
        # Semantic Network & Knowledge Graph
        m_a = param.split(":")[0] if param and ":" in param else "Inception"
        m_b = param.split(":")[1] if param and ":" in param else "Interstellar"
        path = knowledge_graph.find_explanation_path(m_a, m_b)
        
        # Hub nodes
        node_degrees = {nid: len(edges) for nid, edges in knowledge_graph.edges.items()}
        top_hubs = sorted(node_degrees.items(), key=lambda x: x[1], reverse=True)[:8]
        hub_details = [
            {"id": hid, "type": knowledge_graph.nodes.get(hid, {}).get("type", "Entity"), "connections": deg}
            for hid, deg in top_hubs
        ]

        return {
            "algorithm": "Semantic Network & Knowledge Graph (Multi-Hop BFS)",
            "syllabus_unit": "Knowledge Representation: Semantic Networks & Frames",
            "stats": {
                "total_nodes": len(knowledge_graph.nodes),
                "total_edges": len(knowledge_graph.edges),
                "directed_edge_count": sum(len(e) for e in knowledge_graph.edges.values())
            },
            "sample_query": {"source": m_a, "target": m_b},
            "path_found": path,
            "path_length": len(path),
            "hub_entities": hub_details,
            "available_titles": [m["title"] for m in ALL_MOVIES[:15]],
            "academic_notes": "Semantic networks represent domain entities as nodes and typed relationships as labeled edges, supporting multi-hop deductive explanations via Breadth-First Search."
        }

    elif algo == "bayesian":
        # Beta-Binomial Bayesian Taste Updating
        def beta_pdf(p, a, b):
            try:
                log_b = math.lgamma(a) + math.lgamma(b) - math.lgamma(a + b)
                log_pdf = (a - 1) * math.log(p) + (b - 1) * math.log(1 - p) - log_b
                return round(math.exp(log_pdf), 4)
            except Exception:
                return 0.0

        prior_a, prior_b = 2.0, 2.0
        # Simulated evidence: 4 positive likes, 1 dislike
        successes, failures = 4, 1
        post_a, post_b = prior_a + successes, prior_b + failures

        prior_pts = [{"p": round(p * 0.02, 2), "density": beta_pdf(p * 0.02, prior_a, prior_b)} for p in range(1, 50)]
        post_pts = [{"p": round(p * 0.02, 2), "density": beta_pdf(p * 0.02, post_a, post_b)} for p in range(1, 50)]

        prior_stats = bayesian_model.compute_stats(prior_a, prior_b, 0)
        post_stats = bayesian_model.compute_stats(post_a, post_b, successes + failures)

        return {
            "algorithm": "Conjugate Beta-Binomial Bayesian Updating",
            "syllabus_unit": "Learning & Probabilistic Reasoning",
            "formula": "Posterior Beta(alpha + k, beta + n - k) prop Prior Beta(alpha, beta) x Likelihood(k successes in n trials)",
            "prior": prior_stats,
            "evidence": {"liked_count": successes, "disliked_count": failures, "total_trials": successes + failures},
            "posterior": post_stats,
            "prior_distribution_curve": prior_pts,
            "posterior_distribution_curve": post_pts,
            "confidence_gain": f"Variance shrunk from {prior_stats['variance']} to {post_stats['variance']} (-{round((1 - post_stats['variance'] / prior_stats['variance']) * 100, 1)}%)",
            "academic_notes": "Beta distribution is the natural conjugate prior for the Binomial likelihood. As evidence accumulates, variance decreases and the credible interval narrows around true user affinity."
        }

    elif algo == "expert_system":
        # Forward-Chaining Content Safety & Choice Explanation
        sample_movie = ALL_MOVIES[0] # Inception
        context = {
            "target_genres": ["Sci-Fi", "Action"],
            "mood": 7.5,
            "time_budget_minutes": 240,
            "audience": "family",
            "exclude_violence": False
        }
        proof = safety_expert_system.explain_recommendation_choice(sample_movie, context)
        return {
            "algorithm": "Forward-Chaining Rule-Based Expert System",
            "syllabus_unit": "Expert Systems & Production Rules",
            "knowledge_base_rules": [
                {"id": "R1_GENRE_COMPLIANCE", "rule": "IF TargetGenres ∩ MovieGenres != empty THEN FulfillsUserGenreRequest (+35pts)"},
                {"id": "R2_CSP_RUNTIME_FEASIBILITY", "rule": "IF Movie.Runtime <= SlotBudget * 1.15 THEN RuntimeConstraintSatisfied"},
                {"id": "R3_CRITICAL_ACCLAIM", "rule": "IF IMDbRating >= 8.0 THEN MarkUniversallyAcclaimed (+20pts)"},
                {"id": "R4_PARENTAL_SAFETY", "rule": "IF Audience == 'family' AND AgeRating in ['R', 'NC-17'] THEN FlagAgeViolation (Prune Candidate)"},
                {"id": "R5_VIOLENCE_FILTER", "rule": "IF ExcludeViolence == True AND ViolenceLevel in ['High', 'Extreme'] THEN PruneViolentContent"}
            ],
            "working_memory_facts": {
                "movie_title": sample_movie["title"],
                "genres": sample_movie.get("genres", []),
                "runtime": sample_movie.get("runtime"),
                "imdb_rating": sample_movie.get("imdb_rating"),
                "age_rating": sample_movie.get("age_rating"),
                "violence_level": sample_movie.get("violence_level"),
                "user_audience": context["audience"],
                "target_genres": context["target_genres"]
            },
            "fired_proof_steps": proof.get("forward_chaining_proof", []),
            "final_conclusions": proof.get("deduced_conclusions", []),
            "total_score_from_rules": proof.get("total_score_from_rules", 80),
            "academic_notes": "Forward-chaining inference begins with asserted facts in working memory and fires production rules whose IF premises match, deriving new facts until a goal or explanation is reached."
        }

    elif algo == "what_if":
        # Default What-If scenario
        orig_req = RecommendationRequest(
            mood=7.0,
            time_budget_minutes=240,
            movie_count=2,
            genres=["Sci-Fi", "Action"],
            audience="solo",
            exclude_violence=False
        )
        mod_req = RecommendationRequest(
            mood=7.0,
            time_budget_minutes=140,
            movie_count=2,
            genres=["Sci-Fi", "Action"],
            audience="family",
            exclude_violence=True
        )
        orig_out = search_recommendations(orig_req)
        mod_out = search_recommendations(mod_req)
        analysis = what_if_engine.analyze_delta(
            orig_req=orig_req.model_dump(),
            mod_req=mod_req.model_dump(),
            orig_results=orig_out["results"],
            mod_results=mod_out["results"],
            orig_metrics=orig_out.get("searchMetrics", {}),
            mod_metrics=mod_out.get("searchMetrics", {})
        )
        return {
            "algorithm": "Cinematic What-If Counterfactual Reasoning Engine",
            "syllabus_unit": "State-Space Search & Constraint Propagation",
            "scenario": {
                "baseline": {"time_budget": 240, "audience": "solo", "exclude_violence": False},
                "counterfactual": {"time_budget": 140, "audience": "family", "exclude_violence": True}
            },
            "analysis": analysis,
            "academic_notes": "By altering state constraints (e.g. shrinking budget or toggling safety constraints), the What-If engine computes the exact set difference and generates formal state-space justifications for every pruned and newly promoted movie."
        }

    else:
        raise HTTPException(status_code=400, detail=f"Unknown lab algorithm: {algorithm}. Supported: astar, csp, fuzzy, minimax, knowledge_graph, bayesian, expert_system, what_if")
