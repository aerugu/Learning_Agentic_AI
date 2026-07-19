from __future__ import annotations

import os
from dataclasses import dataclass


ORACLE_AGENT_STACK = {
    "supervisor_model": "cohere.command-r-plus",
    "embedding_model": "cohere.embed-english-v3.0",
    "embedding_provider": "OCI Generative AI service",
    "llm_provider": "OCI Generative AI service",
    "cache_provider": "Oracle Coherence",
    "vector_provider": "Oracle Database 23ai AI Vector Search",
    "orchestration_provider": "Oracle AI Agent Studio",
    "evaluation_provider": "Agent Studio built-in evaluation framework",
}


@dataclass(frozen=True)
class RuntimeConfig:
    mode: str
    oci_compartment_id: str | None
    oci_generative_ai_endpoint: str | None
    oracle_ai_agent_studio_endpoint: str | None
    oracle_23ai_vector_search_endpoint: str | None
    oracle_coherence_endpoint: str | None

    @property
    def has_live_oracle_config(self) -> bool:
        return all(
            [
                self.oci_compartment_id,
                self.oci_generative_ai_endpoint,
                self.oracle_ai_agent_studio_endpoint,
                self.oracle_23ai_vector_search_endpoint,
                self.oracle_coherence_endpoint,
            ]
        )


def get_runtime_config() -> RuntimeConfig:
    mode = "oci" if os.getenv("ORACLE_AGENTIC_PROVIDER") == "oci" else "mock"

    return RuntimeConfig(
        mode=mode,
        oci_compartment_id=os.getenv("OCI_COMPARTMENT_ID"),
        oci_generative_ai_endpoint=os.getenv("OCI_GENERATIVE_AI_ENDPOINT"),
        oracle_ai_agent_studio_endpoint=os.getenv("ORACLE_AI_AGENT_STUDIO_ENDPOINT"),
        oracle_23ai_vector_search_endpoint=os.getenv("ORACLE_23AI_VECTOR_SEARCH_ENDPOINT"),
        oracle_coherence_endpoint=os.getenv("ORACLE_COHERENCE_ENDPOINT"),
    )
