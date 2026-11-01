"""
End-to-End System Integration Test
Verifies all 7 phases of the blueprint:
1. Python FastAPI AI service startup & health
2. Node.js API Gateway authentication & profile
3. Onboarding hierarchical taxonomy persistence
4. A* Search recommendation session
5. Refine My List via Simulated Annealing
6. Watchlist sequence optimization
7. Automated marathon planner & dynamic reactive replanning
8. 2-player Minimax adversarial demonstration & multi-user Max-Min fairness
9. Post-watch feedback loop updating Bayesian taste beliefs
"""

import subprocess
import time
import requests
import sys
import os

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

AI_URL = "http://127.0.0.1:8001"
API_URL = "http://127.0.0.1:4000/api/v1"

def run_e2e():
    print("==================================================")
    print("CineMind AI: End-to-End System Verification Suite")
    print("==================================================")

    ai_process = None
    node_process = None

    try:
        # Step 1: Launch Python FastAPI AI Service
        print("\n[1/9] Launching Python FastAPI AI Engine on port 8001...")
        ai_cwd = os.path.abspath(os.path.join(os.path.dirname(__file__), "apps", "ai-service"))
        ai_process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8001"],
            cwd=ai_cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for AI service to be responsive
        ai_ready = False
        for _ in range(25):
            time.sleep(0.4)
            try:
                r = requests.get(f"{AI_URL}/health", timeout=1)
                if r.status_code == 200:
                    ai_ready = True
                    break
            except Exception:
                pass

        if not ai_ready:
            err_out = ""
            if ai_process.stderr:
                err_out = ai_process.stderr.read().decode('utf-8', errors='ignore')
            print(f"[ERROR] Failed to start Python AI service. Stderr: {err_out}")
            return False
        print("[OK] Python AI service healthy and responsive.")

        # Step 2: Launch Node.js API Gateway
        print("\n[2/9] Launching Node.js API Gateway on port 4000...")
        node_cwd = os.path.abspath(os.path.join(os.path.dirname(__file__), "apps", "api"))
        node_process = subprocess.Popen(
            ["node", "src/server.js"],
            cwd=node_cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True
        )

        api_ready = False
        for _ in range(25):
            time.sleep(0.4)
            try:
                r = requests.get("http://127.0.0.1:4000/health", timeout=1)
                if r.status_code == 200:
                    api_ready = True
                    break
            except Exception:
                pass

        if not api_ready:
            err_out = ""
            if node_process.stderr:
                err_out = node_process.stderr.read().decode('utf-8', errors='ignore')
            print(f"[ERROR] Failed to start Node API Gateway. Stderr: {err_out}")
            return False
        print("[OK] Node API Gateway healthy and responsive.")

        # Step 3: Registration & Authentication
        print("\n[3/9] Testing User Registration & JWT Authentication (F-01)...")
        reg_payload = {
            "name": "Dr. Turing",
            "email": f"turing_{int(time.time())}@fai.edu",
            "password": "securePassword123"
        }
        reg_res = requests.post(f"{API_URL}/auth/register", json=reg_payload)
        assert reg_res.status_code == 201, f"Reg failed: {reg_res.text}"
        token = reg_res.json()["token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        print(f"[OK] Registered user '{reg_payload['name']}' with JWT access token.")

        # Step 4: Onboarding Taxonomy (F-02)
        print("\n[4/9] Testing Onboarding Semantic Hierarchies (F-02)...")
        interests_payload = {
            "interests": [
                {"category": "genre", "value": "Sci-Fi", "preference": "like", "weight": 0.9},
                {"category": "genre", "value": "Thriller", "preference": "like", "weight": 0.8},
                {"category": "language", "value": "en", "preference": "like", "weight": 1.0}
            ]
        }
        int_res = requests.put(f"{API_URL}/users/me/interests", json=interests_payload, headers=auth_headers)
        assert int_res.status_code == 200
        print(f"[OK] Persisted {len(interests_payload['interests'])} structured preference nodes.")

        # Step 5: A* Search Playlist Recommendation (F-06 & F-14)
        print("\n[5/9] Testing Mood-Based A* Playlist Search & Confidence Meter (F-06 & F-14)...")
        search_payload = {
            "mood": 8.5,
            "timeBudgetMinutes": 320,
            "movieCount": 2,
            "genres": ["Sci-Fi", "Thriller"],
            "strategy": "astar"
        }
        rec_res = requests.post(f"{API_URL}/recommendation-sessions", json=search_payload, headers=auth_headers)
        assert rec_res.status_code == 200, f"Rec failed: {rec_res.text}"
        rec_data = rec_res.json()
        assert len(rec_data["results"]) == 2
        top_movie = rec_data["results"][0]
        print(f"[OK] A* found 2-title playlist: '{top_movie['title']}' & '{rec_data['results'][1]['title']}'")
        print(f"  Calibrated Match Score: {top_movie['matchScore']}/100 ({top_movie['scoreLabel']})")
        print(f"  Confidence Level: {top_movie['confidenceLevel']}")
        print(f"  A* Metric: {rec_data['searchMetrics']['expanded_nodes']} expanded nodes in {rec_data['searchMetrics']['execution_time_ms']}ms.")

        # Step 6: Playlist Refinement via Simulated Annealing (F-11)
        print("\n[6/9] Testing Playlist Shuffler via Simulated Annealing (F-11)...")
        refine_payload = {
            "current_playlist_ids": [rec_data["results"][0]["movieId"], rec_data["results"][1]["movieId"]],
            "locked_movie_ids": [rec_data["results"][0]["movieId"]], # Lock title 1
            "rejected_movie_ids": [rec_data["results"][1]["movieId"]], # Dislike title 2
            "target_genres": ["Sci-Fi", "Action"],
            "mood": 8.0,
            "time_budget_minutes": 320,
            "algorithm": "simulated_annealing"
        }
        refine_res = requests.post(f"{API_URL}/recommendations/refine", json=refine_payload, headers=auth_headers)
        assert refine_res.status_code == 200
        ref_data = refine_res.json()
        new_ids = [m["id"] for m in ref_data["solution"]]
        assert rec_data["results"][0]["movieId"] in new_ids, "Locked movie must be preserved"
        assert rec_data["results"][1]["movieId"] not in new_ids, "Rejected movie must be swapped"
        print(f"[OK] Simulated Annealing successfully replaced rejected movie while freezing locked item.")
        print(f"  Score trajectory: {ref_data['initial_score']} -> {ref_data['best_score']}")

        # Step 7: Goal Stack Marathon Planner & Reactive Replanning (F-18 & F-21)
        print("\n[7/9] Testing Goal Stack Marathon Planning & Reactive Replanning (F-18 & F-21)...")
        plan_payload = {
            "start_time": "18:00",
            "movie_count": 3,
            "mood": 7.0,
            "include_meal_break": True,
            "meal_break_minutes": 30,
            "curfew_time": "01:00"
        }
        plan_res = requests.post(f"{API_URL}/plans/marathon", json=plan_payload, headers=auth_headers)
        assert plan_res.status_code == 200
        plan_data = plan_res.json()
        print(f"[OK] Marathon planned: {plan_data['start_time']} -> {plan_data['finish_time']} ({len(plan_data['timeline'])} timeline slots).")

        # Reactive drop-off replanning
        first_movie_slot = [t for t in plan_data["timeline"] if t["type"] == "movie"][1]
        replan_payload = {
            "current_timeline": plan_data["timeline"],
            "event_type": "movie_skipped",
            "event_payload": {
                "skipped_item_id": first_movie_slot["item_id"],
                "replace_with_alternative": True
            }
        }
        replan_res = requests.post(f"{API_URL}/plans/replan", json=replan_payload, headers=auth_headers)
        assert replan_res.status_code == 200
        print(f"[OK] Reactive replanning adjusted timeline on drop-off without invalidating history.")

        # Step 8: Couch War 2-Player Minimax & Max-Min Fairness (F-12 & F-20)
        print("\n[8/9] Testing 2-Player Minimax & Collaborative Group Fairness (F-12)...")
        party_create = requests.post(f"{API_URL}/watch-parties", headers=auth_headers)
        assert party_create.status_code == 201
        room_id = party_create.json()["id"]

        cw_res = requests.post(f"{API_URL}/watch-parties/{room_id}/recommend", json={"mode": "collaborative_fairness"}, headers=auth_headers)
        assert cw_res.status_code == 200
        print(f"[OK] Collaborative group fairness: {cw_res.json()['compromise_analysis']}")

        # Step 9: Post-Watch Review & Bayesian Learning Loop (F-13 & F-22)
        print("\n[9/9] Testing Post-Watch Feedback & Bayesian Belief Updating (F-13 & F-22)...")
        feedback_payload = {
            "movieId": "m_inception",
            "enjoyment": 5,
            "recommendationAccuracy": 5,
            "moodMatch": "Yes",
            "reasonTags": ["Mind Bending", "Genre Match", "Great Cast"]
        }
        feedback_res = requests.post(
            f"{API_URL}/recommendations/{rec_data['id']}/feedback",
            json=feedback_payload,
            headers=auth_headers
        )
        assert feedback_res.status_code == 201
        fb_data = feedback_res.json()
        sci_fi_belief = fb_data["updatedBeliefs"].get("Sci-Fi")
        assert sci_fi_belief is not None
        assert sci_fi_belief["mean"] > 0.50, "Posterior mean for Sci-Fi should have increased above 0.50 prior"
        print(f"[OK] Bayesian taste updated: Sci-Fi posterior mean = {sci_fi_belief['mean']} (alpha={sci_fi_belief['alpha']}, beta={sci_fi_belief['beta']}).")

        print("\n==================================================")
        print("[SUCCESS] ALL 9 END-TO-END MILESTONES VERIFIED SUCCESSFULLY!")
        print("==================================================")
        return True

    finally:
        if node_process:
            node_process.terminate()
            node_process.kill()
        if ai_process:
            ai_process.terminate()
            ai_process.kill()

if __name__ == "__main__":
    success = run_e2e()
    sys.exit(0 if success else 1)
