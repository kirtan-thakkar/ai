"""
F-18. Automated Movie Marathon Planner
Algorithm: Goal Stack Planning & Partial-Order Non-Linear Planning
Decomposes high-level goal [SCHEDULE_MARATHON] into structured subgoals:
1. SELECT_CANDIDATE_MOVIES(count, theme, mood)
2. SEQUENCE_TITLES(pacing_arc)
3. INSERT_INTERMISSION_AND_MEAL_BREAKS(interval, meal_time)
4. VERIFY_TEMPORAL_CURFEW(finish_time <= max_finish)
Generates complete minute-by-minute timeline with breaks.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

class MarathonPlanner:
    def __init__(self, movie_catalog: List[Dict[str, Any]]):
        self.catalog = movie_catalog
        self.movie_map = {m["id"]: m for m in movie_catalog}

    def generate_marathon_plan(
        self,
        start_time_str: str = "17:00", # "HH:MM"
        movie_count: int = 3,
        preferred_genres: Optional[List[str]] = None,
        theme: Optional[str] = None,
        mood_slider: float = 7.0,
        intermission_minutes: int = 15,
        include_meal_break: bool = True,
        meal_break_minutes: int = 40,
        curfew_time_str: Optional[str] = "02:00" # Max allowed finish time next day or same night
    ) -> Dict[str, Any]:
        goal_stack = [
            "GOAL:SCHEDULE_MARATHON",
            "SUBGOAL:SELECT_MOVIES",
            "SUBGOAL:SEQUENCE_TITLES",
            "SUBGOAL:INSERT_BREAKS",
            "SUBGOAL:VERIFY_CURFEW"
        ]

        # 1. Action: Select Movies
        candidates = list(self.catalog)
        if preferred_genres:
            matched = [m for m in candidates if any(g in m.get("genres", []) for g in preferred_genres)]
            if len(matched) >= movie_count:
                candidates = matched

        # Sort by ratings and mood compatibility
        from algorithms.fuzzy import FuzzyMoodEngine
        f_engine = FuzzyMoodEngine()
        u_fuzzy = f_engine.evaluate_slider(mood_slider)
        candidates.sort(
            key=lambda m: (
                f_engine.compute_movie_mood_fit(u_fuzzy, m.get("mood_scores", {})),
                m.get("imdb_rating", 7.0)
            ),
            reverse=True
        )

        selected_movies = candidates[:movie_count]

        # 2. Action: Sequence Titles for Pacing Arc (Emotional Build-up)
        from algorithms.sequencer import WatchlistSequencer
        sequencer = WatchlistSequencer(self.movie_map)
        sequenced_result = sequencer.sequence_watchlist(selected_movies, arc_strategy="emotional_buildup")
        ordered_movies = sequenced_result["sequenced_movies"]

        # 3. Action: Build Chronological Timeline with Breaks
        base_date = datetime(2026, 10, 31)
        h, m = map(int, start_time_str.split(":"))
        curr_time = base_date + timedelta(hours=h, minutes=m)

        timeline_items = []
        plan_id = f"plan_{int(datetime.now().timestamp())}"

        for idx, movie in enumerate(ordered_movies):
            runtime_mins = movie.get("runtime", 120)
            movie_start = curr_time
            movie_end = movie_start + timedelta(minutes=runtime_mins)

            timeline_items.append({
                "type": "movie",
                "item_id": movie["id"],
                "title": movie.get("title"),
                "runtime": runtime_mins,
                "genres": movie.get("genres", []),
                "start_time": movie_start.strftime("%H:%M"),
                "end_time": movie_end.strftime("%H:%M"),
                "role": "Warm-up" if idx == 0 else ("Finale" if idx == len(ordered_movies) - 1 else "Feature Presentation")
            })

            curr_time = movie_end

            # Insert break between movies (if not the last one)
            if idx < len(ordered_movies) - 1:
                # If meal break enabled and we are at slot 1 (or halfway)
                is_meal = include_meal_break and (idx == (len(ordered_movies) // 2) - 1 or idx == 0)
                break_mins = meal_break_minutes if is_meal else intermission_minutes
                break_label = "Dinner & Refreshment Break 🍕" if is_meal else "Short Intermission & Snack Refill 🍿"

                break_start = curr_time
                break_end = break_start + timedelta(minutes=break_mins)

                timeline_items.append({
                    "type": "break",
                    "break_type": "meal" if is_meal else "intermission",
                    "label": break_label,
                    "duration_minutes": break_mins,
                    "start_time": break_start.strftime("%H:%M"),
                    "end_time": break_end.strftime("%H:%M")
                })
                curr_time = break_end

        total_duration_minutes = int((curr_time - (base_date + timedelta(hours=h, minutes=m))).total_seconds() // 60)

        # 4. Action: Verify Curfew
        curfew_satisfied = True
        curfew_note = "Within target schedule."
        if curfew_time_str:
            ch, cm = map(int, curfew_time_str.split(":"))
            # If curfew is e.g. 02:00, it's next day
            curfew_datetime = base_date + timedelta(hours=ch, minutes=cm)
            if ch < h:
                curfew_datetime += timedelta(days=1)
            
            if curr_time > curfew_datetime:
                curfew_satisfied = False
                over_mins = int((curr_time - curfew_datetime).total_seconds() // 60)
                curfew_note = f"Warning: Timeline finishes {over_mins} minutes past target curfew of {curfew_time_str}."

        return {
            "plan_id": plan_id,
            "start_time": start_time_str,
            "finish_time": curr_time.strftime("%H:%M"),
            "total_duration_minutes": total_duration_minutes,
            "movie_count": len(ordered_movies),
            "timeline": timeline_items,
            "curfew_satisfied": curfew_satisfied,
            "curfew_note": curfew_note,
            "goal_stack_trace": goal_stack,
            "pacing_explanations": sequenced_result["position_explanations"]
        }
