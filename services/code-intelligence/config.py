"""
Configuration module for Code Intelligence Service.
Phase 1: Project Foundation and Architecture.
"""

from pydantic import BaseModel, Field
import os


class Settings(BaseModel):
    service_name: str = "repopilot-code-intelligence"
    version: str = "0.1.0-phase1"
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    environment: str = Field(default="development")
    log_level: str = Field(default="INFO")
    tree_sitter_enabled: bool = True
    supported_languages: list[str] = [
        "python",
        "typescript",
        "javascript",
        "go",
        "rust",
        "java",
        "cpp",
    ]
    embedding_provider: str = "stub_phase1"


def get_settings() -> Settings:
    return Settings(
        service_name=os.getenv("SERVICE_NAME", "repopilot-code-intelligence"),
        version=os.getenv("SERVICE_VERSION", "0.1.0-phase1"),
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        environment=os.getenv("ENVIRONMENT", "development"),
        log_level=os.getenv("LOG_LEVEL", "INFO"),
        embedding_provider=os.getenv("EMBEDDING_PROVIDER", "stub_phase1"),
    )
