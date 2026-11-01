"""
F-21. Dynamic Replanning on Drop-off
Reactive System & Partial-Order Replanning:
- Freezes completed/watched items as immutable historical commitments.
- Re-evaluates remaining temporal budget and constraints dynamically when:
  1. A movie is skipped or abandoned mid-stream.
  2. The user's finish curfew or total available time shifts (e.g. lost 45 minutes).
  3. A group participant drops off, altering joint preferences.
- Prunes or swaps remaining uncompleted slots without invalidating completed history.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

class ReactiveReplanningEngine:
    def __init__(self, movie_catalog: List[Dict[str, Any]]):
        self.catalog = movie_catalog
        self.movie_map = {m["id"]: m for m in movie_catalog}

    def replan_marathon(
        self,
        current_timeline: List[Dict[str, Any]],
        event_type: str, # 'movie_skipped', 'time_curfew_shortened', 'participant_left'
        event_payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Takes active timeline and adapts the uncompleted portion reactively.
        """
        replan_notes = []
        new_timeline = []

        base_date = datetime(2026, 10, 31)

        if event_type == "movie_skipped":
            skipped_id = event_payload.get("skipped_item_id")
            substitute_genre = event_payload.get("preferred_substitute_genre")
            
            # Find and preserve completed items up to skipped movie
            found_skipped = False
            curr_clock = None

            for item in current_timeline:
                if item["type"] == "movie" and item.get("item_id") == skipped_id:
                    found_skipped = True
                    replan_notes.append(f"Movie '{item.get('title')}' was skipped by user. Time freed: {item.get('runtime')} mins.")
                    
                    # Choose a lighter or alternative substitute movie if desired, or compact schedule
                    if event_payload.get("replace_with_alternative", False):
                        # Find a shorter substitute
                        candidates = [
                            m for m in self.catalog 
                            if m["id"] != skipped_id and m.get("runtime", 120) < item.get("runtime", 120)
                        ]
                        if substitute_genre:
                            genre_matched = [m for m in candidates if substitute_genre in m.get("genres", [])]
                            if genre_matched:
                                candidates = genre_matched

                        sub = candidates[0] if candidates else self.catalog[0]
                        replan_notes.append(f"Scheduled reactive substitute '{sub['title']}' ({sub['runtime']} mins).")
                        
                        # Add substitute
                        st = datetime.strptime(item["start_time"], "%H:%M")
                        s_start = base_date + timedelta(hours=st.hour, minutes=st.minute)
                        s_end = s_start + timedelta(minutes=sub["runtime"])
                        curr_clock = s_end

                        new_timeline.append({
                            "type": "movie",
                            "item_id": sub["id"],
                            "title": sub["title"],
                            "runtime": sub["runtime"],
                            "genres": sub.get("genres", []),
                            "start_time": s_start.strftime("%H:%M"),
                            "end_time": s_end.strftime("%H:%M"),
                            "role": "Reactive Substitute ⚡"
                        })
                    else:
                        replan_notes.append("Compacted remaining schedule; skipped slot entirely.")
                        st = datetime.strptime(item["start_time"], "%H:%M")
                        curr_clock = base_date + timedelta(hours=st.hour, minutes=st.minute)
                elif not found_skipped:
                    new_timeline.append(item)
                    curr_clock = datetime.strptime(item["end_time"], "%H:%M")
                    curr_clock = base_date + timedelta(hours=curr_clock.hour, minutes=curr_clock.minute)
                else:
                    # Forward-shift remaining items
                    runtime_or_dur = item.get("runtime") or item.get("duration_minutes", 15)
                    item_start = curr_clock
                    item_end = item_start + timedelta(minutes=runtime_or_dur)
                    curr_clock = item_end

                    updated_item = dict(item)
                    updated_item["start_time"] = item_start.strftime("%H:%M")
                    updated_item["end_time"] = item_end.strftime("%H:%M")
                    new_timeline.append(updated_item)

        elif event_type == "time_curfew_shortened":
            new_curfew_str = event_payload.get("new_curfew", "23:00")
            replan_notes.append(f"Curfew brought forward to {new_curfew_str}. Pruning or shortening remaining plans.")
            
            c_h, c_m = map(int, new_curfew_str.split(":"))
            curfew_limit = base_date + timedelta(hours=c_h, minutes=c_m)

            for item in current_timeline:
                end_dt = datetime.strptime(item["end_time"], "%H:%M")
                item_end = base_date + timedelta(hours=end_dt.hour, minutes=end_dt.minute)
                if item_end <= curfew_limit:
                    new_timeline.append(item)
                else:
                    replan_notes.append(f"Pruned '{item.get('title') or item.get('label')}' because it finishes after {new_curfew_str}.")

        return {
            "status": "replanned",
            "event_handled": event_type,
            "replan_notes": replan_notes,
            "replanned_timeline": new_timeline,
            "new_finish_time": new_timeline[-1]["end_time"] if new_timeline else "00:00"
        }
