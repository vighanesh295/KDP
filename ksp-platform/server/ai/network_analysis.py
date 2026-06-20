import csv
import os
from collections import defaultdict
from datetime import datetime
from itertools import combinations
from typing import Any, Dict, List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_PATH = os.path.join(BASE_DIR, "data", "synthetic_fir.csv")

DATE_FORMAT = "%Y-%m-%d"
TIME_WINDOW_DAYS = 30


def _load_fir_records() -> List[Dict[str, Any]]:
    records: List[Dict[str, Any]] = []

    with open(DATA_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            accused_name = (row.get("accused_name") or "").strip()
            if not accused_name:
                continue

            try:
                date = datetime.strptime((row.get("date") or "").strip(), DATE_FORMAT)
            except Exception:
                continue

            records.append({
                "fir_number": (row.get("fir_number") or "").strip(),
                "district": (row.get("district") or "").strip(),
                "crime_type": (row.get("crime_type") or "").strip(),
                "ipc_section": (row.get("ipc_section") or "").strip(),
                "date": date,
                "status": (row.get("status") or "").strip(),
                "officer_name": (row.get("officer_name") or "").strip(),
                "accused_name": accused_name,
                "accused_age": (row.get("accused_age") or "").strip(),
                "station": (row.get("station") or "").strip(),
            })

    return records


def build_network() -> Dict[str, List[Dict[str, Any]]]:
    firs = _load_fir_records()

    accused_firs = defaultdict(list)
    for record in firs:
        accused_firs[record["accused_name"]].append(record)

    repeat_accused = [name for name, items in accused_firs.items() if len(items) >= 2]
    if not repeat_accused:
        return {"nodes": [], "edges": []}

    district_case_counts = defaultdict(int)
    accused_district_counts = defaultdict(lambda: defaultdict(int))
    accused_crime_types = defaultdict(set)
    accused_dates = defaultdict(list)

    for accused_name in repeat_accused:
        for record in accused_firs[accused_name]:
            district = record["district"]
            district_case_counts[district] += 1
            accused_district_counts[accused_name][district] += 1
            if record["crime_type"]:
                accused_crime_types[accused_name].add(record["crime_type"])
            accused_dates[accused_name].append(record["date"])

    nodes: List[Dict[str, Any]] = []
    for accused_name in sorted(repeat_accused):
        nodes.append({
            "id": accused_name,
            "label": accused_name,
            "type": "accused",
            "case_count": len(accused_firs[accused_name]),
        })

    district_names = sorted(district_case_counts.keys())
    for district in district_names:
        nodes.append({
            "id": district,
            "label": district,
            "type": "district",
            "case_count": district_case_counts[district],
        })

    edges: List[Dict[str, Any]] = []

    # Accused-to-district edges show where repeat accused appear.
    for accused_name, districts in accused_district_counts.items():
        for district, count in districts.items():
            edges.append({
                "source": accused_name,
                "target": district,
                "weight": count,
            })

    # Accused-to-accused edges represent shared co-occurrence.
    for accused_a, accused_b in combinations(sorted(repeat_accused), 2):
        shared_districts = set(accused_district_counts[accused_a]).intersection(accused_district_counts[accused_b])
        shared_crimes = accused_crime_types[accused_a].intersection(accused_crime_types[accused_b])

        time_shared = 0
        for date_a in accused_dates[accused_a]:
            for date_b in accused_dates[accused_b]:
                if abs((date_a - date_b).days) <= TIME_WINDOW_DAYS:
                    time_shared += 1

        weight = len(shared_districts) + len(shared_crimes) + (1 if time_shared > 0 else 0)
        if weight > 0:
            edges.append({
                "source": accused_a,
                "target": accused_b,
                "weight": weight,
            })

    return {"nodes": nodes, "edges": edges}


def _compute_node_scores(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> Dict[str, int]:
    scores = {node["id"]: 0 for node in nodes}
    for edge in edges:
        source = edge["source"]
        target = edge["target"]
        weight = int(edge.get("weight", 1))
        if source in scores:
            scores[source] += weight
        if target in scores:
            scores[target] += weight
    return scores


def filter_network(node_limit: int = 30) -> Dict[str, List[Dict[str, Any]]]:
    graph = build_network()
    if len(graph["nodes"]) <= node_limit:
        return graph

    scores = _compute_node_scores(graph["nodes"], graph["edges"])
    top_node_ids = sorted(scores, key=lambda node_id: scores[node_id], reverse=True)[:node_limit]
    selected_nodes = [node for node in graph["nodes"] if node["id"] in top_node_ids]
    selected_edges = [edge for edge in graph["edges"] if edge["source"] in top_node_ids and edge["target"] in top_node_ids]

    return {"nodes": selected_nodes, "edges": selected_edges}


def build_person_graph(accused_name: str) -> Dict[str, List[Dict[str, Any]]]:
    graph = build_network()
    name_map = {node["id"].lower(): node["id"] for node in graph["nodes"] if node["type"] == "accused"}
    target_id = name_map.get(accused_name.strip().lower())
    if not target_id:
        return {"nodes": [], "edges": []}

    connected_node_ids = {target_id}
    connected_edges: List[Dict[str, Any]] = []
    for edge in graph["edges"]:
        if edge["source"] == target_id or edge["target"] == target_id:
            connected_edges.append(edge)
            connected_node_ids.add(edge["source"])
            connected_node_ids.add(edge["target"])

    connected_nodes = [node for node in graph["nodes"] if node["id"] in connected_node_ids]
    connected_edges = [edge for edge in graph["edges"] if edge["source"] in connected_node_ids and edge["target"] in connected_node_ids]

    # Rebuild accused -> FIR records mapping for case history lookup
    firs = _load_fir_records()
    accused_firs = defaultdict(list)
    for record in firs:
        accused_firs[record["accused_name"]].append(record)

    case_history = []
    for record in accused_firs.get(target_id, []):
        case_history.append({
            "fir_number": record["fir_number"],
            "district": record["district"],
            "crime_type": record["crime_type"],
            "ipc_section": record["ipc_section"],
            "date": record["date"].strftime(DATE_FORMAT),
            "status": record["status"],
            "station": record["station"],
        })

    case_history.sort(key=lambda item: item["date"], reverse=True)

    return {"nodes": connected_nodes, "edges": connected_edges, "case_history": case_history}
