from __future__ import annotations

from dataclasses import dataclass

from agentic.config import ORACLE_AGENT_STACK, RuntimeConfig
from agentic.data import RECOMMENDATIONS


_SEMANTIC_CACHE: dict[str, dict[str, object]] = {}


@dataclass(frozen=True)
class EmbeddingResult:
    model: str
    dimensions: int
    values: list[float]


@dataclass(frozen=True)
class VectorSearchResult:
    course_id: str
    score: float
    reason: str


class OracleCoherenceCache:
    def __init__(self, config: RuntimeConfig):
        self.config = config

    def get(self, key: str) -> dict[str, object] | None:
        if self._should_use_live_service():
            raise NotImplementedError("Oracle Coherence live adapter requires service auth.")

        return _SEMANTIC_CACHE.get(key)

    def set(self, key: str, value: dict[str, object]) -> None:
        if self._should_use_live_service():
            raise NotImplementedError("Oracle Coherence live adapter requires service auth.")

        _SEMANTIC_CACHE[key] = value

    def _should_use_live_service(self) -> bool:
        return self.config.mode == "oci" and self.config.has_live_oracle_config


class OciCohereEmbeddingClient:
    def __init__(self, config: RuntimeConfig):
        self.config = config

    def embed(self, text: str) -> EmbeddingResult:
        if self.config.mode == "oci" and self.config.has_live_oracle_config:
            raise NotImplementedError("OCI Cohere Embed live adapter requires OCI request signing.")

        return EmbeddingResult(
            model=ORACLE_AGENT_STACK["embedding_model"],
            dimensions=1024,
            values=_deterministic_embedding(text, 32),
        )


class Oracle23AiVectorSearchClient:
    def __init__(self, config: RuntimeConfig):
        self.config = config

    def search_courses(self, embedding: EmbeddingResult, query: str) -> list[VectorSearchResult]:
        if self.config.mode == "oci" and self.config.has_live_oracle_config:
            raise NotImplementedError("Oracle Database 23ai live adapter requires DB credentials.")

        normalized = query.lower()
        query_tokens = [token for token in _tokenize(normalized) if len(token) > 4]
        matches: list[VectorSearchResult] = []

        for index, course in enumerate(RECOMMENDATIONS):
            text = f"{course.title} {course.match_reason} {course.audience}".lower()
            lexical_boost = sum(1 for token in query_tokens if token in text)
            embedding_boost = embedding.values[index % len(embedding.values)]
            score = min(0.98, 0.72 + lexical_boost * 0.05 + embedding_boost * 0.03)
            matches.append(
                VectorSearchResult(
                    course_id=course.course_id,
                    score=score,
                    reason=f"Oracle 23ai vector match using {ORACLE_AGENT_STACK['embedding_model']}",
                )
            )

        return sorted(matches, key=lambda item: item.score, reverse=True)


class OciGenerativeAiCommandRClient:
    def __init__(self, config: RuntimeConfig):
        self.config = config

    def summarize(self, prompt: str) -> str:
        if self.config.mode == "oci" and self.config.has_live_oracle_config:
            raise NotImplementedError("OCI Generative AI live adapter requires OCI request signing.")

        return f"Cohere Command R+ mock response grounded in policy citations for: {prompt}"


class OracleAiAgentStudioClient:
    def __init__(self, config: RuntimeConfig):
        self.config = config

    def run_supervisor(self) -> dict[str, object]:
        if self.config.mode == "oci" and self.config.has_live_oracle_config:
            raise NotImplementedError("Oracle AI Agent Studio live adapter requires endpoint auth.")

        return {
            "supervisor": "Compliance Supervisor",
            "model": ORACLE_AGENT_STACK["supervisor_model"],
            "tools": [
                "HCM Business Object Tool",
                "Document Tool",
                "Oracle Database 23ai Vector Search",
                "Oracle Coherence semantic cache",
            ],
        }


class AgentStudioEvaluationClient:
    def __init__(self, config: RuntimeConfig):
        self.config = config

    def score(self, citation_count: int, record_count: int) -> dict[str, object]:
        if self.config.mode == "oci" and self.config.has_live_oracle_config:
            raise NotImplementedError("Agent Studio evaluation live adapter requires API binding.")

        citation_coverage = 1 if record_count == 0 else min(1, citation_count / (record_count * 2))
        faithfulness = 0.96 if citation_coverage >= 0.9 else 0.88
        answer_relevance = 0.93 if record_count > 0 else 0.8

        return {
            "framework": ORACLE_AGENT_STACK["evaluation_provider"],
            "dataset": "50-case compliance golden set",
            "faithfulness": faithfulness,
            "answerRelevance": answer_relevance,
            "citationCoverage": citation_coverage,
            "deploymentGate": "pass" if citation_coverage >= 0.85 else "review",
        }


def _deterministic_embedding(text: str, dimensions: int) -> list[float]:
    hash_value = 2166136261

    for character in text:
        hash_value ^= ord(character)
        hash_value = (hash_value * 16777619) & 0xFFFFFFFF

    values: list[float] = []

    for index in range(dimensions):
        hash_value ^= index + 0x9E3779B9
        hash_value = (hash_value * 16777619) & 0xFFFFFFFF
        values.append((hash_value % 1000) / 1000)

    return values


def _tokenize(value: str) -> list[str]:
    token = ""
    tokens: list[str] = []

    for character in value:
        if character.isalnum():
            token += character
        elif token:
            tokens.append(token)
            token = ""

    if token:
        tokens.append(token)

    return tokens
