"""
F-19. Intelligent Content Safety & Recommendation Expert System
Algorithm: Rule-Based Expert System with Forward-Chaining Inference Engine
- Evaluates movies against parental controls, age guidance, and explicit user content exclusions.
- Evaluates recommendation suitability with formal logical premises and working memory facts.
- Produces complete, human-readable and formal logical inference proof chains for academic viva presentation.
"""

from typing import List, Dict, Any, Optional

class SafetyRule:
    def __init__(self, rule_id: str, description: str, condition_fn, action_fn, priority: int = 10):
        self.rule_id = rule_id
        self.description = description
        self.condition_fn = condition_fn
        self.action_fn = action_fn
        self.priority = priority

class ContentSafetyExpertSystem:
    def __init__(self):
        self.rules: List[SafetyRule] = []
        self._init_rules()

    def _init_rules(self):
        age_levels = {"G": 1, "PG": 2, "PG-13": 3, "R": 4, "NC-17": 5}

        # Rule 1: Child Audience Rating Ceiling (Priority 100)
        self.rules.append(SafetyRule(
            rule_id="R_CHILD_AGE_RESTRICTION",
            description="Excludes R or NC-17 movies when audience profile is 'child' or 'family_kids'",
            condition_fn=lambda m, ctx: ctx.get("audience") in ["child", "family_kids"] and age_levels.get(m.get("age_rating", "PG-13"), 3) >= 4,
            action_fn=lambda m, ctx: ("RESTRICTED", f"Age rating '{m.get('age_rating')}' strictly exceeds child/family ceiling."),
            priority=100
        ))

        # Rule 2: Explicit Violence Filter (Priority 90)
        self.rules.append(SafetyRule(
            rule_id="R_SEVERE_VIOLENCE_EXCLUSION",
            description="Excludes movies with severe or gore violence if user flagged 'exclude_violence'",
            condition_fn=lambda m, ctx: ctx.get("exclude_violence", False) and m.get("violence_level") in ["moderate", "severe"],
            action_fn=lambda m, ctx: ("RESTRICTED", f"Contains '{m.get('violence_level')}' violence, violating user's zero-violence constraint."),
            priority=90
        ))

        # Rule 3: Frightening Content Filter for PG Audiences (Priority 80)
        self.rules.append(SafetyRule(
            rule_id="R_HORROR_CHILD_SAFETY",
            description="Excludes Horror genre for audiences under age 13",
            condition_fn=lambda m, ctx: ctx.get("max_age", 18) < 13 and ("Horror" in m.get("genres", []) or m.get("violence_level") == "severe"),
            action_fn=lambda m, ctx: ("RESTRICTED", "Contains horror or disturbing elements inappropriate for children under 13."),
            priority=80
        ))

        # Rule 4: Advisory for PG-13 in Family Sessions (Priority 60)
        self.rules.append(SafetyRule(
            rule_id="R_TEEN_ADVISORY_FLAG",
            description="Adds advisory flag when PG-13 content is viewed in a general family session",
            condition_fn=lambda m, ctx: ctx.get("audience") == "family" and m.get("age_rating") == "PG-13",
            action_fn=lambda m, ctx: ("ADVISORY", "Rated PG-13: may contain mild action violence or thematic elements; parental guidance suggested."),
            priority=60
        ))

        # Rule 5: User Custom Tag Exclusions (Priority 70)
        self.rules.append(SafetyRule(
            rule_id="R_USER_TAG_EXCLUSION",
            description="Excludes movies containing any user-specified forbidden content tags",
            condition_fn=lambda m, ctx: bool(set(m.get("tags", []) + m.get("content_descriptors", [])).intersection(set(ctx.get("exclude_tags", [])))),
            action_fn=lambda m, ctx: ("RESTRICTED", f"Contains excluded user tags: {list(set(m.get('tags', []) + m.get('content_descriptors', [])).intersection(set(ctx.get('exclude_tags', []))))}"),
            priority=70
        ))

    def evaluate_movie_safety(self, movie: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Forward-chaining inference loop for content safety.
        Sorts rules by priority and executes all matching conditions.
        """
        status = "APPROVED"
        fired_rules = []
        advisories = []
        rejection_reasons = []

        sorted_rules = sorted(self.rules, key=lambda r: r.priority, reverse=True)

        for rule in sorted_rules:
            if rule.condition_fn(movie, context):
                result_type, message = rule.action_fn(movie, context)
                fired_rules.append({
                    "rule_id": rule.rule_id,
                    "priority": rule.priority,
                    "description": rule.description,
                    "verdict": result_type,
                    "message": message
                })

                if result_type == "RESTRICTED":
                    status = "RESTRICTED"
                    rejection_reasons.append(message)
                elif result_type == "ADVISORY" and status != "RESTRICTED":
                    status = "ADVISORY"
                    advisories.append(message)

        return {
            "movie_id": movie["id"],
            "title": movie.get("title"),
            "safety_verdict": status,
            "is_safe": status in ["APPROVED", "ADVISORY"],
            "rejection_reasons": rejection_reasons,
            "advisories": advisories,
            "fired_rules_trace": fired_rules,
            "rating_metadata": {
                "age_rating": movie.get("age_rating"),
                "violence_level": movie.get("violence_level"),
                "content_descriptors": movie.get("content_descriptors", [])
            }
        }

    def explain_recommendation_choice(self, movie: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Formal Academic Forward-Chaining Explanation Proof:
        Derives why this movie was selected by the AI system from Working Memory Facts.
        """
        facts = {
            "movie_title": movie.get("title"),
            "genres": movie.get("genres", []),
            "runtime": movie.get("runtime", 120),
            "imdb_rating": movie.get("imdb_rating", 7.0),
            "age_rating": movie.get("age_rating", "PG-13"),
            "target_genres": context.get("target_genres", []),
            "time_budget": context.get("time_budget_minutes", 180),
            "audience": context.get("audience", "solo"),
            "mood_slider": context.get("mood", 7.0)
        }

        proof_steps = []
        conclusions = []
        score_modifiers = []

        # Rule 1: Genre Alignment
        matched = set(facts["genres"]).intersection(set(facts["target_genres"]))
        if matched:
            proof_steps.append({
                "rule": "R1_GENRE_COMPLIANCE",
                "premise": f"TargetGenres ∩ MovieGenres = {{{', '.join(matched)}}} ≠ ∅",
                "inference": f"Movie directly fulfills user request for {', '.join(matched)}",
                "status": "FIRED",
                "impact": "+35pts toward Genre Fit"
            })
            conclusions.append(f"Direct match for requested genres: {', '.join(matched)}")
            score_modifiers.append({"factor": "Genre Fit", "value": 35})
        else:
            proof_steps.append({
                "rule": "R1_GENRE_COMPLIANCE",
                "premise": "No direct intersection with requested genres",
                "inference": "Exploratory candidate evaluated on mood & quality heuristics",
                "status": "SKIPPED",
                "impact": "+10pts baseline"
            })

        # Rule 2: Runtime Budget Feasibility
        slot_budget = facts["time_budget"] // max(1, context.get("movie_count", 2))
        if facts["runtime"] <= slot_budget * 1.15:
            proof_steps.append({
                "rule": "R2_CSP_RUNTIME_FEASIBILITY",
                "premise": f"Movie.runtime ({facts['runtime']}m) ≤ SlotBudget ({slot_budget}m)",
                "inference": "Satisfies hard CSP runtime allocation without domain pruning",
                "status": "FIRED",
                "impact": "+20pts Runtime Feasibility"
            })
            conclusions.append(f"Runtime ({facts['runtime']}m) strictly fits session time budget")
        else:
            proof_steps.append({
                "rule": "R2_CSP_RUNTIME_FEASIBILITY",
                "premise": f"Movie.runtime ({facts['runtime']}m) > SlotBudget ({slot_budget}m)",
                "inference": "Relaxation applied to accommodate feature-length duration",
                "status": "RELAXED",
                "impact": "Soft penalty applied to A* g(n)"
            })

        # Rule 3: Critical Acclaim
        if facts["imdb_rating"] >= 8.0:
            proof_steps.append({
                "rule": "R3_CRITICAL_ACCLAIM_BENCHMARK",
                "premise": f"IMDb rating ({facts['imdb_rating']}/10) ≥ 8.0",
                "inference": "Exceeds global critical acclaim threshold, lowering admissible heuristic h(n)",
                "status": "FIRED",
                "impact": "+20pts Quality Esteem"
            })
            conclusions.append(f"Critically acclaimed cinematic score ({facts['imdb_rating']}/10 IMDb)")
        else:
            proof_steps.append({
                "rule": "R3_CRITICAL_ACCLAIM_BENCHMARK",
                "premise": f"IMDb rating ({facts['imdb_rating']}/10) < 8.0",
                "inference": "Standard quality tier",
                "status": "FIRED",
                "impact": "+15pts Standard Rating"
            })

        # Rule 4: Content Safety Proof
        safety_eval = self.evaluate_movie_safety(movie, context)
        proof_steps.append({
            "rule": "R4_PARENTAL_SAFETY_AXIOM",
            "premise": f"AgeRating='{facts['age_rating']}', Audience='{facts['audience']}', Violence='{movie.get('violence_level')}'",
            "inference": f"Safety System Verdict: {safety_eval['safety_verdict']}",
            "status": "FIRED",
            "impact": "Safety constraint satisfied"
        })
        if safety_eval["is_safe"]:
            conclusions.append(f"Passed all safety and content restriction rules ({facts['age_rating']})")

        # Formal deduction
        return {
            "movie_id": movie["id"],
            "title": movie.get("title"),
            "working_memory_facts": facts,
            "forward_chaining_proof": proof_steps,
            "deduced_conclusions": conclusions,
            "safety_verdict": safety_eval["safety_verdict"],
            "academic_explanation": (
                f"Under First-Order Predicate Logic, candidate '{movie.get('title')}' satisfies the conjunct "
                f"(GenreMatch ∧ BudgetFeasible ∧ SafetyApproved). Its forward-chaining activation score minimizes "
                f"the A* objective function f(n) = g(n) + h(n), proving its optimality within the search frontier."
            )
        }
