from fastapi import FastAPI, Depends, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Any
import os

app = FastAPI(title="TigerGraph API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("API_KEY", "dev-key")

# Map vertex types to frontend colors
TYPE_COLORS: dict[str, str] = {
    "Service":             "#FF6B35",
    "Incident":            "#E74C3C",
    "Change":              "#F39C12",
    "BusinessApplication": "#2A7FFF",
    "Application":         "#2A7FFF",
    "Person":              "#FF6B35",
    "Company":             "#2A7FFF",
}
DEFAULT_NODE_COLOR = "#8B949E"
DEFAULT_EDGE_COLOR = "#3D444D"


# ── Auth ──────────────────────────────────────────────────────────────────────

def require_api_key(x_api_key: str = Header(..., alias="X-API-Key")) -> str:
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ── Auth check ───────────────────────────────────────────────────────────────

@app.get("/test_api_key")
def test_api_key(_key: str = Depends(require_api_key)):
    return {"status": "ok"}


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/get-entites")
def get_entities(
    vertex_type: str,
    limit: int = Query(default=100, ge=1, le=5000, description="Max number of vertices to return"),
    _key: str = Depends(require_api_key),
):
    """Return vertices of the requested type, capped by limit."""
    # TODO: replace with real TigerGraph call:
    #   results = conn.getVertices(vertex_type, limit=limit)
    #   return {"results": results}
    return {
        "results": [
            {"v_id": "s1", "v_type": vertex_type, "attributes": {"name": "Example A"}},
            {"v_id": "s2", "v_type": vertex_type, "attributes": {"name": "Example B"}},
        ]
    }


@app.get("/get-impacted-entities")
def get_impacted_entities(
    vertex_type: str,
    _key: str = Depends(require_api_key),
):
    """Return impacted vertices of the requested type."""
    # TODO: replace with real TigerGraph call
    return {
        "results": [
            {"v_id": "s1", "v_type": vertex_type, "attributes": {"name": "Example A"}},
            {
                "e_type": "IMPACTS",
                "from_id": "s1", "from_type": vertex_type,
                "to_id":   "s2", "to_type":   vertex_type,
                "attributes": {"severity": "high"},
            },
            {"v_id": "s2", "v_type": vertex_type, "attributes": {"name": "Example B"}},
        ]
    }


# ── Topology formatter ────────────────────────────────────────────────────────

def _extract(
    data: Any,
    nodes: list[dict],
    links: list[dict],
    seen: set[str],
) -> None:
    """Recursively walk any TigerGraph JSON and pull out vertices and edges."""
    if isinstance(data, dict):
        if "v_id" in data and "v_type" in data:
            node_id = str(data["v_id"])
            if node_id not in seen:
                seen.add(node_id)
                v_type = data.get("v_type", "Unknown")
                attrs  = data.get("attributes", {})
                label  = attrs.get("name") or attrs.get("label") or node_id
                nodes.append({
                    "id":         node_id,
                    "label":      str(label),
                    "type":       v_type,
                    "val":        10,
                    "color":      TYPE_COLORS.get(v_type, DEFAULT_NODE_COLOR),
                    "attributes": attrs,
                })
        elif "e_type" in data and "from_id" in data and "to_id" in data:
            src = str(data["from_id"])
            tgt = str(data["to_id"])
            links.append({
                "source":     src,
                "target":     tgt,
                "type":       data.get("e_type", "RELATES"),
                "color":      DEFAULT_EDGE_COLOR,
                "attributes": data.get("attributes", {}),
            })
            # ensure both endpoints appear as nodes even if not listed separately
            for nid, ntype in [(src, data.get("from_type", "Unknown")),
                               (tgt, data.get("to_type",   "Unknown"))]:
                if nid not in seen:
                    seen.add(nid)
                    nodes.append({
                        "id":         nid,
                        "label":      nid,
                        "type":       ntype,
                        "val":        8,
                        "color":      TYPE_COLORS.get(ntype, DEFAULT_NODE_COLOR),
                        "attributes": {},
                    })
        else:
            for v in data.values():
                _extract(v, nodes, links, seen)
    elif isinstance(data, list):
        for item in data:
            _extract(item, nodes, links, seen)


def _compute_val(nodes: list[dict], links: list[dict]) -> None:
    """Scale node size by degree (number of connected edges)."""
    degree: dict[str, int] = {}
    for link in links:
        degree[link["source"]] = degree.get(link["source"], 0) + 1
        degree[link["target"]] = degree.get(link["target"], 0) + 1
    for node in nodes:
        node["val"] = 8 + degree.get(node["id"], 0) * 3


@app.post("/format_topology_view")
def format_topology_view(
    data: dict[str, Any],
    _key: str = Depends(require_api_key),
):
    """
    Expected input shape:
    {
      "_meta": { ... },
      "data": [
        {
          "nodes_to_return": [ { v_id, v_type, attributes }, ... ],
          "@@Edges":         [ { e_type, from_id, from_type, to_id, to_type, directed, attributes }, ... ]
        }
      ]
    }
    """
    nodes: list[dict] = []
    links: list[dict] = []
    seen:  set[str]   = set()

    records: list[dict] = data.get("data", [])
    if not records:
        return {"nodes": nodes, "links": links}

    record = records[0]

    # ── Nodes ──────────────────────────────────────────────────────────────
    for v in record.get("nodes_to_return", []):
        node_id = str(v.get("v_id", ""))
        if not node_id or node_id in seen:
            continue
        seen.add(node_id)
        v_type = v.get("v_type", "Unknown")
        attrs  = v.get("attributes", {})
        label  = attrs.get("name") or attrs.get("label") or node_id
        nodes.append({
            "id":         node_id,
            "label":      str(label),
            "type":       v_type,
            "val":        10,
            "color":      TYPE_COLORS.get(v_type, DEFAULT_NODE_COLOR),
            "attributes": attrs,
        })

    # ── Edges ──────────────────────────────────────────────────────────────
    for e in record.get("@@Edges", []):
        src = str(e.get("from_id", ""))
        tgt = str(e.get("to_id",   ""))
        if not src or not tgt:
            continue
        links.append({
            "source":     src,
            "target":     tgt,
            "type":       e.get("e_type", "RELATES"),
            "color":      DEFAULT_EDGE_COLOR,
            "attributes": e.get("attributes", {}),
        })
        # add implicit nodes for endpoints not present in nodes_to_return
        for nid, ntype in [(src, e.get("from_type", "Unknown")),
                           (tgt, e.get("to_type",   "Unknown"))]:
            if nid not in seen:
                seen.add(nid)
                nodes.append({
                    "id":         nid,
                    "label":      nid,
                    "type":       ntype,
                    "val":        8,
                    "color":      TYPE_COLORS.get(ntype, DEFAULT_NODE_COLOR),
                    "attributes": {},
                })

    _compute_val(nodes, links)

    return {"nodes": nodes, "links": links}
