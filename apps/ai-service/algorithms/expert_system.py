"""
F-19. Intelligent Content Safety Advisor
Algorithm: Rule-Based Expert System with Forward-Chaining Inference Engine
Evaluates movies against parental controls, age guidance, and explicit user content exclusions.
Executes rules in conflict resolution order, logging the complete inference chain.
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
        Forward-chaining inference loop.
        Sorts rules by priority and executes all matching conditions.
        """
        status = "APPROVED"
        fired_rules = []
        advisories = []
        rejection_reasons = []

        # Sort rules descending by priority
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
            "safety_verdict": status, # 'APPROVED', 'ADVISORY', 'RESTRICTED'
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
