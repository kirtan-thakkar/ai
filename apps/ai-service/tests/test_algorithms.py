"""
Comprehensive Unit Test Suite for All Syllabus AI Algorithms
Run with: python -m unittest apps/ai-service/tests/test_algorithms.py
"""

import unittest
import sys
import os

# Add parent directory to sys.path so we can import algorithms
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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

class TestAIAlgorithms(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Sample mini-catalogue for hand-verifiable testing
        cls.test_movies = [
            {
                "id": "t_inception",
                "title": "Inception",
                "release_year": 2010,
                "runtime": 148,
                "language": "en",
                "genres": ["Sci-Fi", "Action", "Thriller"],
                "age_rating": "PG-13",
                "violence_level": "moderate",
                "content_descriptors": ["intense action violence"],
                "directors": ["Christopher Nolan"],
                "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt"],
                "franchise": None,
                "themes": ["dreams", "heist", "subconscious"],
                "mood_scores": {"chill": 0.2, "energetic": 0.8, "intense": 0.9, "thoughtful": 0.95, "feel_good": 0.4},
                "frame_type": "SciFiThrillerFilm",
                "imdb_rating": 8.8,
                "tags": ["mind_bending"]
            },
            {
                "id": "t_interstellar",
                "title": "Interstellar",
                "release_year": 2014,
                "runtime": 169,
                "language": "en",
                "genres": ["Sci-Fi", "Drama"],
                "age_rating": "PG-13",
                "violence_level": "mild",
                "content_descriptors": ["space peril"],
                "directors": ["Christopher Nolan"],
                "cast": ["Matthew McConaughey", "Anne Hathaway"],
                "franchise": None,
                "themes": ["space_exploration", "black_hole", "time_dilation"],
                "mood_scores": {"chill": 0.4, "energetic": 0.6, "intense": 0.85, "thoughtful": 1.0, "feel_good": 0.6},
                "frame_type": "SciFiThrillerFilm",
                "imdb_rating": 8.7,
                "tags": ["wormhole"]
            },
            {
                "id": "t_paddington",
                "title": "Paddington 2",
                "release_year": 2017,
                "runtime": 103,
                "language": "en",
                "genres": ["Comedy", "Family", "Adventure"],
                "age_rating": "PG",
                "violence_level": "none",
                "content_descriptors": ["mild comic action"],
                "directors": ["Paul King"],
                "cast": ["Ben Whishaw", "Hugh Grant"],
                "franchise": None,
                "themes": ["kindness", "family"],
                "mood_scores": {"chill": 0.9, "energetic": 0.6, "intense": 0.1, "thoughtful": 0.5, "feel_good": 1.0},
                "frame_type": "CozyAnimationFilm",
                "imdb_rating": 7.8,
                "tags": ["wholesome"]
            },
            {
                "id": "t_iron_man",
                "title": "Iron Man",
                "release_year": 2008,
                "runtime": 126,
                "language": "en",
                "genres": ["Action", "Sci-Fi"],
                "age_rating": "PG-13",
                "violence_level": "moderate",
                "content_descriptors": ["action violence"],
                "directors": ["Jon Favreau"],
                "cast": ["Robert Downey Jr.", "Gwyneth Paltrow"],
                "franchise": "Marvel",
                "themes": ["arc_reactor", "origin_story"],
                "mood_scores": {"chill": 0.4, "energetic": 0.9, "intense": 0.6, "thoughtful": 0.65, "feel_good": 0.85},
                "frame_type": "MarvelFilm",
                "imdb_rating": 7.9,
                "tags": ["mcu"]
            },
            {
                "id": "t_godfather",
                "title": "The Godfather",
                "release_year": 1972,
                "runtime": 175,
                "language": "en",
                "genres": ["Crime", "Drama"],
                "age_rating": "R",
                "violence_level": "moderate",
                "content_descriptors": ["mob violence", "language"],
                "directors": ["Francis Ford Coppola"],
                "cast": ["Marlon Brando", "Al Pacino"],
                "franchise": None,
                "themes": ["mafia_family", "loyalty"],
                "mood_scores": {"chill": 0.4, "energetic": 0.5, "intense": 0.9, "thoughtful": 0.95, "feel_good": 0.4},
                "frame_type": "DarkCrimeDramaFilm",
                "imdb_rating": 9.2,
                "tags": ["corleone"]
            }
        ]

    # 1. Fuzzy Mood
    def test_fuzzy_mood(self):
        engine = FuzzyMoodEngine()
        # Mood 2.0 should be predominantly chill
        res_low = engine.evaluate_slider(2.0)
        self.assertGreater(res_low["chill"], res_low["intense"])
        # Mood 9.0 should be predominantly intense
        res_high = engine.evaluate_slider(9.0)
        self.assertGreater(res_high["intense"], res_high["chill"])
        # Text enhancement test
        text_res = engine.evaluate_text_and_slider(5.0, "need a calm rainy relax film")
        self.assertGreater(text_res["membership_degrees"]["chill"], 0.5)

    # 2. Bayesian Taste Updating
    def test_bayesian_updating(self):
        model = BayesianTasteModel()
        prior = model.get_initial_belief()
        self.assertEqual(prior["mean"], 0.5)

        # 5-star rating must increase posterior mean
        update_pos = model.update_genre_belief(prior, "rating", 5.0)
        self.assertGreater(update_pos["posterior"]["mean"], prior["mean"])

        # Dislike must lower posterior mean
        update_neg = model.update_genre_belief(prior, "dislike")
        self.assertLess(update_neg["posterior"]["mean"], prior["mean"])

    # 3. Frames Inheritance
    def test_frame_inheritance(self):
        engine = FrameKnowledgeEngine()
        movie = self.test_movies[3] # Iron Man (MarvelFilm)
        res = engine.resolve_movie_slots(movie)
        chain = res["inheritance_chain"]
        self.assertIn("GeneralFilm", chain)
        self.assertIn("MarvelFilm", chain)
        # Check verified override takes precedence
        self.assertEqual(res["provenance"]["title"], "verified_title_specific")

    # 4. Knowledge Graph
    def test_knowledge_graph_path(self):
        kg = MovieKnowledgeGraph(self.test_movies)
        self.assertIn("t_inception", kg.nodes)
        self.assertIn("t_interstellar", kg.nodes)
        path = kg.find_explanation_path("t_inception", "t_interstellar")
        self.assertGreater(len(path), 0)
        # Should link via common entity (Director or Genre)
        bridge_entity = path[0]["to_node"]["label"]
        self.assertIn(bridge_entity, ["Christopher Nolan", "Sci-Fi"])

    # 5. A* Search
    def test_astar_search(self):
        engine = AStarRecommender(self.test_movies)
        fuzzy_deg = {"chill": 0.2, "energetic": 0.8, "intense": 0.9, "thoughtful": 0.9, "feel_good": 0.5}
        result = engine.search_playlist(
            target_count=2,
            time_budget_minutes=350,
            target_genres=["Sci-Fi", "Action"],
            user_fuzzy_degrees=fuzzy_deg,
            mood_slider=8.0
        )
        self.assertEqual(len(result["movies"]), 2)
        self.assertLessEqual(result["total_runtime"], 350)
        self.assertGreater(result["metrics"]["expanded_nodes"], 0)

    # 6. CSP Backtracking with Forward Checking
    def test_csp_forward_checking(self):
        solver = CSPPlaylistSolver(self.test_movies)
        # Budget 250 with 15 min break for 2 movies allows Inception (148) + Paddington (103) + 15 = 266 (exceeds 250)
        # but Iron Man (126) + Paddington (103) + 15 = 244 (fits <= 250)
        res = solver.solve(slot_count=2, time_budget_minutes=250, break_duration_minutes=15)
        self.assertTrue(res["success"])
        self.assertEqual(len(res["solution"]), 2)
        self.assertLessEqual(res["total_session_time"], 250)

    # 7. Beam Search
    def test_beam_search(self):
        planner = BeamSearchPlaylistPlanner(self.test_movies)
        fuzzy_deg = {"chill": 0.5, "energetic": 0.5, "intense": 0.5, "thoughtful": 0.5, "feel_good": 0.5}
        res = planner.search(target_count=2, time_budget_minutes=320, target_genres=["Sci-Fi"], user_fuzzy_degrees=fuzzy_deg, beam_width=2)
        self.assertEqual(len(res["solution"]), 2)
        self.assertEqual(res["metrics"]["beam_width"], 2)

    # 8. Local Search / Simulated Annealing
    def test_local_search_refine(self):
        optimizer = PlaylistLocalSearchOptimizer(self.test_movies)
        fuzzy_deg = {"chill": 0.5, "energetic": 0.5, "intense": 0.5, "thoughtful": 0.5, "feel_good": 0.5}
        # We lock Inception, but reject Godfather
        res = optimizer.refine_playlist(
            current_playlist_ids=["t_inception", "t_godfather"],
            locked_movie_ids=["t_inception"],
            rejected_movie_ids=["t_godfather"],
            target_genres=["Sci-Fi", "Family"],
            user_fuzzy_degrees=fuzzy_deg,
            time_budget_minutes=300,
            algorithm="simulated_annealing",
            max_iterations=20
        )
        sol_ids = [m["id"] for m in res["solution"]]
        self.assertIn("t_inception", sol_ids)
        self.assertNotIn("t_godfather", sol_ids)

    # 9. Watchlist Sequencer
    def test_sequencer(self):
        seq = WatchlistSequencer({m["id"]: m for m in self.test_movies})
        res = seq.sequence_watchlist(self.test_movies, arc_strategy="emotional_buildup")
        # In emotional buildup, Paddington 2 (gentle) should precede Inception (high intensity)
        titles = [m["title"] for m in res["sequenced_movies"]]
        pad_idx = titles.index("Paddington 2")
        inc_idx = titles.index("Inception")
        self.assertLess(pad_idx, inc_idx)

    # 10. Alternatives Finder (k-NN)
    def test_alternatives_finder(self):
        finder = AlternativeMovieFinder(self.test_movies)
        res = finder.find_alternatives("t_inception", k=2)
        self.assertGreater(len(res["alternatives"]), 0)
        # Nearest candidate to Inception should be Interstellar (both Nolan, Sci-Fi)
        top_alt = res["alternatives"][0]["movie"]["id"]
        self.assertEqual(top_alt, "t_interstellar")

    # 11. Minimax & Collaborative Group Fairness
    def test_couch_war(self):
        engine = CouchWarEngine(self.test_movies)
        # Minimax 2-player demo
        res_mm = engine.run_minimax_demonstration(
            player1_prefs={"liked_genres": ["Sci-Fi", "Action"], "disliked_genres": ["Family"]},
            player2_prefs={"liked_genres": ["Drama", "Crime"], "disliked_genres": ["Sci-Fi"]},
            max_depth=2
        )
        self.assertIn("selected_movie", res_mm)
        self.assertGreaterEqual(res_mm["metrics"]["alpha_beta_cutoffs"], 0)

        # Collaborative Max-Min fairness
        res_fair = engine.recommend_for_group(
            participants=[
                {"name": "Alice", "liked_genres": ["Sci-Fi"], "disliked_genres": [], "vetoes": []},
                {"name": "Bob", "liked_genres": ["Family", "Comedy"], "disliked_genres": ["Crime"], "vetoes": ["Crime"]}
            ],
            top_k=2
        )
        self.assertGreater(len(res_fair["recommendations"]), 0)
        # Godfather must be vetoed by Bob
        rec_ids = [r["movie"]["id"] for r in res_fair["recommendations"]]
        self.assertNotIn("t_godfather", rec_ids)

    # 12. Rule-Based Expert System
    def test_content_safety_expert_system(self):
        es = ContentSafetyExpertSystem()
        # Child audience viewing R-rated Godfather must be RESTRICTED
        godfather = self.test_movies[4]
        res_child = es.evaluate_movie_safety(godfather, {"audience": "child", "exclude_violence": False})
        self.assertEqual(res_child["safety_verdict"], "RESTRICTED")

        # Paddington 2 for child must be APPROVED
        paddington = self.test_movies[2]
        res_pad = es.evaluate_movie_safety(paddington, {"audience": "child", "exclude_violence": False})
        self.assertEqual(res_pad["safety_verdict"], "APPROVED")

    # 13. Marathon Planner
    def test_marathon_planner(self):
        planner = MarathonPlanner(self.test_movies)
        res = planner.generate_marathon_plan(start_time_str="18:00", movie_count=2, curfew_time_str="23:30")
        self.assertIn("timeline", res)
        self.assertEqual(res["movie_count"], 2)
        # Ensure breaks exist in timeline
        types = [item["type"] for item in res["timeline"]]
        self.assertIn("break", types)

    # 14. Reactive Replanning
    def test_reactive_replanning(self):
        replanner = ReactiveReplanningEngine(self.test_movies)
        initial_timeline = [
            {"type": "movie", "item_id": "t_inception", "title": "Inception", "runtime": 148, "start_time": "18:00", "end_time": "20:28"},
            {"type": "break", "duration_minutes": 20, "start_time": "20:28", "end_time": "20:48"},
            {"type": "movie", "item_id": "t_godfather", "title": "The Godfather", "runtime": 175, "start_time": "20:48", "end_time": "23:43"}
        ]
        res = replanner.replan_marathon(
            initial_timeline,
            event_type="movie_skipped",
            event_payload={"skipped_item_id": "t_godfather", "replace_with_alternative": True}
        )
        self.assertEqual(res["status"], "replanned")
        # Substituted movie should finish earlier than 23:43
        new_finish = res["new_finish_time"]
        self.assertNotEqual(new_finish, "23:43")

    # 15. Confidence Meter
    def test_confidence_meter(self):
        cm = ConfidenceMeter()
        movie = self.test_movies[0] # Inception
        fuzzy_deg = {"chill": 0.2, "energetic": 0.8, "intense": 0.9, "thoughtful": 0.95, "feel_good": 0.4}
        conf = cm.compute_movie_confidence(
            movie=movie,
            target_genres=["Sci-Fi", "Action"],
            user_fuzzy_degrees=fuzzy_deg,
            user_genre_beliefs={},
            target_runtime_budget=150
        )
        self.assertGreaterEqual(conf["match_score"], 0)
        self.assertLessEqual(conf["match_score"], 100)
        self.assertIn(conf["confidence_level"], ["High Confidence", "Moderate Confidence", "Exploratory Match"])

    # 16. Natural Language Goal Parser
    def test_nl_parser(self):
        parser = NaturalLanguageGoalParser()
        res = parser.parse_goal("I have a rainy evening, two hours, and I'm watching with family. Suggest something light and funny.")
        constraints = res["parsed_constraints"]
        self.assertEqual(constraints["max_runtime_minutes"], 120)
        self.assertEqual(constraints["audience"], "family")
        self.assertIn("Comedy", constraints["genres"])
        self.assertLessEqual(constraints["mood"], 4.0)

if __name__ == "__main__":
    unittest.main()
