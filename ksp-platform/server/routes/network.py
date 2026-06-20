from fastapi import APIRouter, HTTPException
from ai.network_analysis import build_network, filter_network, build_person_graph

router = APIRouter()

@router.get("/")
def get_network():
    return filter_network(node_limit=30)

@router.get("/{accused_name}")
def get_person_network(accused_name: str):
    graph = build_person_graph(accused_name)
    if not graph["nodes"]:
        raise HTTPException(status_code=404, detail=f"No network data found for accused '{accused_name}'")
    return graph
