# CineMind AI — Intelligent Movie Discovery & Planning Platform

> **A personalized, mood-aware, constraint-based movie recommendation and planning agent.**  
> Prepared as a complete, syllabus-aligned academic software project for **Foundations of Artificial Intelligence (FAI)**.

---

## 🌟 Executive Overview & Architectural Design

CineMind AI is a full-stack, modular intelligent agent that understands:
1. **What** a person wants to watch (genres, themes, franchises, languages).
2. **Why** they want to watch it (mood, occasion, audience context).
3. **How much time** they have (temporal budget & intermission intervals).
4. **Who is watching with them** (Couch War adversarial game trees and multi-user fairness).
5. **How their feedback changes future recommendations** (Bayesian preference updating).

### System Architecture (Modular Monolith)

```
                            [ Web Browser / Client ]
                                       │
                                       │ HTTPS / JSON
                                       ▼
                       [ Node.js + Express API Gateway ]
                         Port: 4000  (Base: /api/v1)
                         ├─ JWT Authentication & Users
                         ├─ Onboarding Taxonomy & Profiles
                         ├─ Watchlists & Sequencing
                         ├─ Watch Party Rooms & Sessions
                         └─ Post-Watch Reviews Storage
                                       │
                                       │ Internal HTTP Proxy
                                       ▼
                       [ Python FastAPI AI Engine ]
                         Port: 8001  (Docs: /docs)
                         ├─ F-06: A* Search Playlist Planner
                         ├─ F-07: CSP & Forward Checking
                         ├─ F-08: Beam Search Memory Saver
                         ├─ F-09: Greedy Best-First Sequencer
                         ├─ F-10: k-NN Alternative Finder
                         ├─ F-11: Simulated Annealing Shuffler
                         ├─ F-12: Minimax & Max-Min Group Fairness
                         ├─ F-13: Conjugate Beta-Binomial Bayesian Updating
                         ├─ F-14: Calibrated Confidence Meter
                         ├─ F-15: Movie Knowledge Graph (BFS Paths)
                         ├─ F-16: Frame-Based Inheritance & Provenance
                         ├─ F-17: Fuzzy Mood Detection (Triangular/Trapezoidal)
                         ├─ F-18: Goal Stack Movie Marathon Planner
                         ├─ F-19: Rule-Based Content Safety Advisor
                         └─ F-21: Dynamic Reactive Replanning on Drop-off
```

---

## 🔬 Syllabus Algorithms & Mathematical Specifications

| Feature | Algorithm | State Space & Mathematical Formulation |
| :--- | :--- | :--- |
| **F-06. Mood A\* Search** | A\* Heuristic Search | State $S = \langle \text{movies}, \text{runtime}, g(n), \text{used\_genres} \rangle$. $f(n) = g(n) + h(n)$. $g(n) = \sum \text{step\_cost}(m)$. Mood scaling $\lambda = \text{mood}/10.0$. Admissible heuristic $h(n) = \sum \min(\text{remaining\_candidate\_costs})$. |
| **F-07. Time-Budget CSP** | CSP with Forward Checking | Variables $X_1 \dots X_N$. Constraint: $\sum \text{runtime}(X_i) + \sum \text{breaks} \le \text{Budget}$. Forward checking: prunes candidate $m'$ if $\text{runtime}(m') > \text{remaining} - (N - 1 - k)\min(\text{domain})$. Domain wipeout triggers immediate backtrack. |
| **F-08. Beam Search** | Bounded Heuristic Search | Memory-bounded search retaining strictly the top $k$ partial states at each depth $d \in \{1 \dots N\}$, discarding inferior branches to guarantee $O(k \cdot b)$ memory footprint. |
| **F-09. Watchlist Sequencer** | Greedy Best-First Search | Re-sequences saved titles according to emotional arcs: $\text{Intensity} = 0.6 \cdot \text{intense} + 0.4 \cdot \text{energetic} - 0.3 \cdot \text{chill}$. Sorts in ascending order for warm-up $\to$ climax. |
| **F-10. Alternative Movie Finder** | Nearest-Neighbor (k-NN) | Multi-attribute distance: $0.25 \cdot \text{director\_match} + 0.25 \cdot \text{Jaccard}_{\text{genre}} + 0.20 \cdot \text{Overlap}_{\text{theme}} + 0.15 \cdot \text{Cosine}_{\text{mood}} + 0.10 \cdot \text{cast\_sim} + 0.05 \cdot \text{rt\_fit}$. |
| **F-11. Playlist Shuffler** | Simulated Annealing | Freezes user-locked titles; perturbs rejected titles with candidates from domain. Accepts improving moves ($\Delta > 0$); accepts worse moves with probability $P = \exp(\Delta / T)$, cooling via $T_{k+1} = \alpha T_k$. |
| **F-12. Couch War** | Minimax + $\alpha$-$\beta$ Pruning | 2-Player zero-sum tree evaluating payoff difference $U_1(m) - U_2(m)$. Prunes branches when $\beta \le \alpha$. Also implements multi-user Collaborative Max-Min Fairness: $\max_m \min_i u_i(m)$. |
| **F-13. Bayesian Taste Updating** | Conjugate Beta-Binomial | Prior $Beta(\alpha_0, \beta_0)$. Rating 5 $\implies \Delta\alpha = 2.5, \Delta\beta = 0.1$; Dislike $\implies \Delta\alpha = 0, \Delta\beta = 2.0$. Posterior mean $\hat{\theta} = \frac{\alpha}{\alpha + \beta}$; Variance $\sigma^2 = \frac{\alpha\beta}{(\alpha+\beta)^2(\alpha+\beta+1)}$. |
| **F-14. Confidence Meter** | Calibrated Multi-Factor Score | Match score out of 100: Genre (35%) + Mood (25%) + Bayesian History (20%) + Rating (10%) + Runtime (10%). Uncertainty warnings flagged on sparse history ($n < 3$). |
| **F-15. Movie Knowledge Graph** | Semantic Network & BFS | Graph $G = (V, E)$ with typed edges (`:DIRECTED_BY`, `:HAS_GENRE`, `:PART_OF`, `:HAS_THEME`). Explanations generated via BFS shortest path between entities. |
| **F-16. Frame-Based Inheritance** | Frames, Slots & Provenance | `GeneralFilm` $\to$ `ActionBlockbusterFilm` $\to$ `SuperheroFilm` $\to$ `MarvelFilm`. Resolved slots annotate provenance (`inherited_from_Frame` vs `verified_title_specific`). |
| **F-17. Fuzzy Mood Detection** | Fuzzy Logic Sets | Maps continuous 1–10 slider to triangular & trapezoidal membership degrees $\mu_{\text{chill}}, \mu_{\text{balanced}}, \mu_{\text{energetic}}, \mu_{\text{intense}}, \mu_{\text{thoughtful}} \in [0.0, 1.0]$. |
| **F-18. Movie Marathon Planner** | Goal Stack Planning | Decomposes `[GOAL:SCHEDULE_MARATHON]` into subgoals: `SELECT_MOVIES`, `SEQUENCE_TITLES`, `INSERT_BREAKS`, `VERIFY_CURFEW`. Minute-by-minute timeline schedule. |
| **F-19. Content Safety Advisor** | Rule-Based Expert System | Forward-chaining production rules ($R_1 \dots R_5$) prioritizing child age limits, explicit user violence exclusions, and regional content descriptors. |
| **F-21. Reactive Replanning** | Reactive Temporal Repair | Dynamic schedule revision upon movie drop-off or curfew advance, preserving watched history as immutable anchors. |
| **F-22. Feedback Learning Loop** | Multi-Signal Closed Loop | Distinguishes film enjoyment (1–5) from recommendation request fit (1–5) and mood alignment to update genre parameters separately from context models. |

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

### Running Everything with One Command
```bash
python start.py
```
This automatically starts:
- **Web Application**: [http://localhost:4000](http://localhost:4000)
- **Node.js API Gateway**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **FastAPI AI Docs**: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)
- **Academic Viva Playground**: [http://localhost:4000/viva](http://localhost:4000/viva)

---

## 🧪 Automated Test Suites

### 1. Algorithm Correctness Unit Tests (Python)
Rigorously tests all 16 AI algorithm functions on hand-verifiable datasets:
```bash
python -m unittest apps/ai-service/tests/test_algorithms.py
```
*Expected output: `Ran 16 tests in 0.005s. OK`*

### 2. Node.js API Gateway Integration Tests
Tests JWT auth, registration, login, protected routes, and watchlist persistence:
```bash
cd apps/api
npm test
```
*Expected output: `All API integration tests PASSED successfully!`*

### 3. Full End-to-End Verification Suite
Launches both services and verifies all 9 integration milestones:
```bash
python test_e2e.py
```
*Expected output: `[SUCCESS] ALL 9 END-TO-END MILESTONES VERIFIED SUCCESSFULLY!`*

---

## 🎓 Academic Viva Demonstration Script

For oral presentation or laboratory examination, walk through the following 9 steps:

1. **User Onboarding (F-01 & F-02):**  
   Register a new profile and navigate to `/onboarding`. Show how genres and franchises are selected in a structured hierarchy rather than a flat list.
2. **AI Goal Assistant & Fuzzy Mood (F-04 & F-17):**  
   In `/discover`, type: *"I have a rainy evening, 2 hours, watching with family. Suggest something light without violence."* Show how intent extraction converts the text into structured constraints and maps to fuzzy degrees ($\mu_{\text{chill}}=0.85$).
3. **A\* Search & Forward Checking (F-06 & F-07):**  
   Set mood to 8/10 and time budget to 320 mins. Launch search with A\*. Show node expansion count and explain how forward checking pruned candidates whose runtimes could not fit remaining slots.
4. **Calibrated Confidence Meter (F-14):**  
   In the results view, inspect the confidence meter: show supporting factors (genre match, critical rating) and uncertainty factors.
5. **Playlist Refinement via Simulated Annealing (F-11):**  
   Click the Lock icon on Movie 1, dislike Movie 2, and click "Refine List". Show the Simulated Annealing score trajectory and confirm Movie 1 stayed frozen while Movie 2 was substituted.
6. **Alternative Movie Finder (F-10):**  
   Click "Alternatives" on Inception. Explain how k-NN multi-attribute feature vectors ranked Interstellar as the top substitute (directed by Christopher Nolan, shared Sci-Fi theme, similar runtime).
7. **Couch War & Max-Min Fairness (F-12 & F-20):**  
   Open `/watch-party`. Demonstrate 2-player Minimax with alpha-beta cutoffs, then switch to Collaborative Max-Min fairness to show how the compromise maximizes the minimum satisfaction of the least happy viewer.
8. **Goal Stack Marathon Planning & Reactive Replanning (F-18 & F-21):**  
   Open `/planner`, schedule a 3-movie marathon with a 30-min dinner break. Click "Simulate Skip & Replan" on Movie 2 to show how the reactive system forward-shifts remaining items without recomputing history.
9. **Post-Watch Feedback & Bayesian Beliefs (F-13 & F-22):**  
   Mark a recommended title watched, submit a 5-star review, and navigate to `/profile/preferences` to see the posterior mean and credible interval shift upward in real-time.

---

## 📁 Repository Structure

```
ai/
├── apps/
│   ├── ai-service/             # Python FastAPI AI Engine
│   │   ├── algorithms/         # 12 Syllabus AI Algorithm implementations
│   │   │   ├── astar.py        # A* Search with mood heuristic & lambda
│   │   │   ├── csp.py          # CSP with Backtracking & Forward Checking
│   │   │   ├── beam_search.py  # Bounded Beam Search
│   │   │   ├── local_search.py # Hill Climbing & Simulated Annealing
│   │   │   ├── minimax.py      # Minimax + Alpha-Beta & Max-Min Fairness
│   │   │   ├── bayesian.py     # Beta-Binomial Bayesian Taste Updating
│   │   │   ├── fuzzy.py        # Fuzzy Mood Logic Membership
│   │   │   ├── frames.py       # Frame-Based Knowledge Representation
│   │   │   ├── knowledge_graph.py # Semantic Network & BFS Paths
│   │   │   ├── planning.py     # Goal Stack Marathon Planner
│   │   │   ├── expert_system.py# Rule-Based Content Safety Advisor
│   │   │   ├── reactive.py     # Dynamic Reactive Replanning
│   │   │   ├── sequencer.py    # Greedy Best-First Watchlist Sequencer
│   │   │   ├── alternatives.py # k-NN Nearest-Neighbor Finder
│   │   │   └── confidence.py   # Calibrated Confidence Meter
│   │   ├── data/               # Curated movie catalogue & taxonomies
│   │   ├── models/schemas.py   # Pydantic request & response contracts
│   │   ├── tests/              # 16 algorithm unit tests
│   │   └── main.py             # FastAPI REST endpoints
│   ├── api/                    # Node.js + Express API Gateway
│   │   ├── src/
│   │   │   ├── routes/         # Express routes (/auth, /watchlists, etc.)
│   │   │   ├── storage.js      # Relational storage engine (db.json)
│   │   │   └── server.js       # API server & production static server
│   │   └── test_api.js         # API integration test suite
│   └── web/                    # React + TypeScript + Tailwind CSS Frontend
│       ├── src/
│       │   ├── components/     # MovieCard, ConfidenceMeter, FuzzySlider, etc.
│       │   ├── pages/          # 13 cinematic dark-theme pages
│       │   └── services/api.ts # API client with JWT interceptor
├── database/                   # Persistent relational storage (db.json)
├── start.py                    # Single-command dev launcher
├── test_e2e.py                 # Full 9-phase integration verification suite
└── README.md                   # Complete documentation blueprint
```

---

## 📜 License & Academic Integrity
Prepared strictly for academic research and evaluation in **Foundations of Artificial Intelligence (FAI)**. No copyrighted media is streamed or hosted; all metadata is curated for algorithmic demonstration.
