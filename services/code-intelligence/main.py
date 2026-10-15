"""
RepoPilot AI - Code Intelligence Service (FastAPI)
Phase 1: Project Foundation and Architecture.
Provides health diagnostics, AST parser capability discovery, and contract stubs.
"""

import sys
import time
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import get_settings

settings = get_settings()

app = FastAPI(
    title="RepoPilot Code Intelligence Service",
    description="AST-based code intelligence, symbol extraction, and semantic retrieval foundation",
    version=settings.version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

start_time = time.time()


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str
    version: str
    environment: str
    python_version: str
    uptime_seconds: float
    tree_sitter_supported_languages: List[str]
    phase: str = "Phase 1: Foundation"


class AstSymbol(BaseModel):
    name: str
    kind: str  # function, class, interface, method, import
    start_line: int
    end_line: int
    signature: Optional[str] = None


class ParseRequest(BaseModel):
    language: str = Field(..., description="Language identifier (e.g. typescript, python)")
    source_code: str = Field(..., description="Source code snippet to parse")


class ParseResponse(BaseModel):
    language: str
    symbols: List[AstSymbol]
    node_count: int
    message: str


@app.get("/health", response_model=HealthResponse)
def get_health():
    """
    Returns structured service health and language parser availability.
    """
    return HealthResponse(
        status="ok",
        service=settings.service_name,
        version=settings.version,
        environment=settings.environment,
        python_version=sys.version.split()[0],
        uptime_seconds=round(time.time() - start_time, 2),
        tree_sitter_supported_languages=settings.supported_languages,
        phase="Phase 1: Foundation",
    )


@app.get("/api/v1/capabilities")
def get_capabilities():
    """
    Exposes code intelligence capabilities for repository indexing in future phases.
    """
    return {
        "ast_parsing": {
            "engine": "tree-sitter",
            "supported_languages": settings.supported_languages,
            "status": "foundation_ready",
        },
        "retrieval": {
            "bm25_keyword_search": "planned_phase2",
            "dense_vector_embeddings": "planned_phase2",
            "hybrid_reranking": "planned_phase2",
        },
        "limits": {
            "max_file_size_bytes": 1024 * 1024 * 5,  # 5 MB
            "max_repository_files": 50000,
        },
    }


@app.post("/api/v1/ast/parse-preview", response_model=ParseResponse)
def parse_preview(req: ParseRequest):
    """
    Phase 1 preview endpoint demonstrating AST parsing contract.
    """
    lang = req.language.lower()
    if lang not in settings.supported_languages:
        raise HTTPException(
            status_code=400,
            detail=f"Language '{req.language}' not in supported set: {settings.supported_languages}",
        )

    # In Phase 1: contract validation & structural verification
    lines = req.source_code.splitlines()
    detected_symbols: List[AstSymbol] = []

    for idx, line in enumerate(lines, start=1):
        stripped = line.strip()
        if stripped.startswith("def ") or stripped.startswith("async def "):
            name = stripped.split("(")[0].replace("async def ", "").replace("def ", "").strip()
            detected_symbols.append(AstSymbol(name=name, kind="function", start_line=idx, end_line=idx, signature=stripped))
        elif stripped.startswith("class "):
            name = stripped.split("(")[0].split(":")[0].replace("class ", "").strip()
            detected_symbols.append(AstSymbol(name=name, kind="class", start_line=idx, end_line=idx, signature=stripped))
        elif stripped.startswith("function ") or "export function " in stripped:
            name = stripped.split("(")[0].split()[-1]
            detected_symbols.append(AstSymbol(name=name, kind="function", start_line=idx, end_line=idx, signature=stripped))
        elif stripped.startswith("interface ") or "export interface " in stripped:
            name = stripped.split("{")[0].split()[-1]
            detected_symbols.append(AstSymbol(name=name, kind="interface", start_line=idx, end_line=idx, signature=stripped))

    return ParseResponse(
        language=lang,
        symbols=detected_symbols,
        node_count=len(lines),
        message="AST preview parsed successfully (full tree-sitter grammars active in Phase 2)",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
