"""
F-15. Movie Knowledge Graph
Graph-based semantic network modeling entities (Movie, Person, Genre, Franchise, Theme)
and typed relationships. Supports multi-hop explanation paths and connected recommendations.
"""

from typing import Dict, Any, List, Set, Tuple, Optional
from collections import deque
import json
import os

class MovieKnowledgeGraph:
    def __init__(self, movies: Optional[List[Dict[str, Any]]] = None):
        self.nodes: Dict[str, Dict[str, Any]] = {} # id -> {type, label, ...}
        self.edges: List[Dict[str, Any]] = []      # list of {source, target, relation, weight}
        self.adjacency: Dict[str, List[Dict[str, Any]]] = {}

        if movies:
            self.build_graph(movies)

    def add_node(self, node_id: str, node_type: str, label: str, metadata: Optional[Dict[str, Any]] = None):
        if node_id not in self.nodes:
            self.nodes[node_id] = {
                "id": node_id,
                "type": node_type,
                "label": label,
                "metadata": metadata or {}
            }
            self.adjacency[node_id] = []

    def add_edge(self, source: str, target: str, relation: str, weight: float = 1.0, bidirectional: bool = True):
        edge = {"source": source, "target": target, "relation": relation, "weight": weight}
        self.edges.append(edge)
        if source in self.adjacency:
            self.adjacency[source].append({"node": target, "relation": relation, "weight": weight})
        
        if bidirectional:
            rev_rel = f"REV_{relation}"
            if target in self.adjacency:
                self.adjacency[target].append({"node": source, "relation": rev_rel, "weight": weight})

    def build_graph(self, movies: List[Dict[str, Any]]):
        for m in movies:
            m_id = m["id"]
            self.add_node(m_id, "Movie", m["title"], {"runtime": m.get("runtime"), "year": m.get("release_year")})

            # Genres
            for g in m.get("genres", []):
                g_id = f"genre_{g.lower().replace(' ', '_')}"
                self.add_node(g_id, "Genre", g)
                self.add_edge(m_id, g_id, "HAS_GENRE", weight=1.0)

            # Directors
            for d in m.get("directors", []):
                d_id = f"person_{d.lower().replace(' ', '_')}"
                self.add_node(d_id, "Director", d)
                self.add_edge(m_id, d_id, "DIRECTED_BY", weight=1.5)

            # Cast
            for a in m.get("cast", []):
                a_id = f"person_{a.lower().replace(' ', '_')}"
                self.add_node(a_id, "Actor", a)
                self.add_edge(m_id, a_id, "STARRING", weight=1.2)

            # Franchise
            fr = m.get("franchise")
            if fr:
                fr_id = f"fr_{fr.lower().replace(' ', '_')}"
                self.add_node(fr_id, "Franchise", fr)
                self.add_edge(m_id, fr_id, "PART_OF", weight=2.0)

            # Themes
            for th in m.get("themes", []):
                th_id = f"theme_{th.lower().replace(' ', '_')}"
                self.add_node(th_id, "Theme", th.replace("_", " ").title())
                self.add_edge(m_id, th_id, "HAS_THEME", weight=1.1)

    def find_explanation_path(self, movie_a_id: str, movie_b_id: str, max_depth: int = 3) -> List[Dict[str, Any]]:
        """
        BFS to find shortest and most meaningful explanatory semantic path between two movies.
        E.g. Inception -> DIRECTED_BY -> Christopher Nolan -> REV_DIRECTED_BY -> Interstellar
        """
        if movie_a_id not in self.adjacency or movie_b_id not in self.adjacency:
            return []

        queue = deque([(movie_a_id, [])])
        visited = {movie_a_id}

        paths = []
        while queue:
            curr, path = queue.popleft()
            if len(path) > max_depth * 2:
                continue

            if curr == movie_b_id and path:
                return path

            for neighbor in self.adjacency.get(curr, []):
                n_id = neighbor["node"]
                rel = neighbor["relation"]
                if n_id == movie_b_id:
                    return path + [{
                        "from_node": self.nodes.get(curr),
                        "relation": rel,
                        "to_node": self.nodes.get(n_id)
                    }]
                if n_id not in visited and len(path) < max_depth:
                    visited.add(n_id)
                    queue.append((n_id, path + [{
                        "from_node": self.nodes.get(curr),
                        "relation": rel,
                        "to_node": self.nodes.get(n_id)
                    }]))

        return []

    def get_related_subgraph(self, movie_id: str, hops: int = 1) -> Dict[str, Any]:
        """Returns 1-hop or 2-hop ego-network around a movie for UI graph rendering."""
        if movie_id not in self.nodes:
            return {"nodes": [], "edges": []}

        sub_nodes = {movie_id: self.nodes[movie_id]}
        sub_edges = []

        curr_level = {movie_id}
        for _ in range(hops):
            next_level = set()
            for n_id in curr_level:
                for edge in self.adjacency.get(n_id, []):
                    target = edge["node"]
                    sub_nodes[target] = self.nodes.get(target, {"id": target, "type": "Unknown", "label": target})
                    sub_edges.append({
                        "source": n_id,
                        "target": target,
                        "relation": edge["relation"].replace("REV_", "")
                    })
                    next_level.add(target)
            curr_level = next_level

        return {
            "center_movie": movie_id,
            "nodes": list(sub_nodes.values()),
            "edges": sub_edges
        }
