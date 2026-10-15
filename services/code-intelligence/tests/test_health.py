"""
Tests for Code Intelligence Health Endpoint.
"""

from fastapi.testclient import TestClient
import sys
import os

# Ensure services/code-intelligence is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "repopilot-code-intelligence"
    assert "uptime_seconds" in data
    assert "tree_sitter_supported_languages" in data
    assert "python" in data["tree_sitter_supported_languages"]


def test_capabilities_endpoint():
    response = client.get("/api/v1/capabilities")
    assert response.status_code == 200
    data = response.json()
    assert "ast_parsing" in data
    assert data["ast_parsing"]["engine"] == "tree-sitter"


def test_parse_preview():
    payload = {
        "language": "python",
        "source_code": "def calculate_sum(a, b):\n    return a + b\n"
    }
    response = client.post("/api/v1/ast/parse-preview", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "python"
    assert len(data["symbols"]) == 1
    assert data["symbols"][0]["name"] == "calculate_sum"
