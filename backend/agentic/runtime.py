from __future__ import annotations

from datetime import datetime, timezone

from agentic.config import ORACLE_AGENT_STACK, get_runtime_config
from agentic.data import (
    LEARNER_RECORDS,
    QUERY_TEMPLATES,
    RECOMMENDATIONS,
    CourseRecommendation,
    LearnerRecord,
    QueryTemplate,
    template_to_json,
)
from agentic.providers import (
    AgentStudioEvaluationClient,
    OciCohereEmbeddingClient,
    OciGenerativeAiCommandRClient,
    Oracle23AiVectorSearchClient,
    OracleAiAgentStudioClient,
    OracleCoherenceCache,
    VectorSearchResult,
)


def run_agentic_compliance_query(request: dict[str, str]) -> dict[str, object]:
    template = _find_template(request.get("templateId", ""))
    query = request["query"]
    cache_key = _build_cache_key(query, template)
    config = get_runtime_config()
    cache = OracleCoherenceCache(config)
    cached = cache.get(cache_key)

    if cached:
        cached["cacheStatus"] = "hit"
        cached["generatedAt"] = _timestamp()
        cached["trace"] = [
            _trace_step(
                step_id="cache-hit",
                agent="Semantic Cache",
                platform=ORACLE_AGENT_STACK["cache_provider"],
                model_or_service=ORACLE_AGENT_STACK["cache_provider"],
                action="Returned cached agent result",
                status="passed",
                details="Oracle Coherence cache key matched query, template, and manager scope.",
            ),
            *cached["trace"],
        ]
        return cached

    agent_studio = OracleAiAgentStudioClient(config)
    embedding_client = OciCohereEmbeddingClient(config)
    vector_search = Oracle23AiVectorSearchClient(config)
    llm = OciGenerativeAiCommandRClient(config)
    evaluator = AgentStudioEvaluationClient(config)

    agent_studio.run_supervisor()
    records = resolve_records(template, query)
    embedding = embedding_client.embed(query)
    vector_matches = vector_search.search_courses(embedding, query)
    ranked_recommendations = _rank_recommendations(vector_matches)
    summary = summarize(records, template)
    llm.summarize(summary)

    citation_count = sum(len(record.citations) for record in records)
    evaluation = evaluator.score(citation_count=citation_count, record_count=len(records))

    result: dict[str, object] = {
        "query": query,
        "template": template_to_json(template),
        "generatedAt": _timestamp(),
        "runtimeMode": config.mode,
        "supervisorModel": ORACLE_AGENT_STACK["supervisor_model"],
        "embeddingModel": ORACLE_AGENT_STACK["embedding_model"],
        "cacheStatus": "miss",
        "records": [record.to_json() for record in records],
        "recommendations": [course.to_json() for course in ranked_recommendations],
        "summary": summary,
        "trace": _build_trace(records, ranked_recommendations),
        "evaluation": evaluation,
    }

    cache.set(cache_key, result)
    return result


def resolve_records(template: QueryTemplate, query: str) -> list[LearnerRecord]:
    normalized = f"{template.intent} {query}".lower()

    if "complete" in normalized and "not completed" not in normalized:
        return list(LEARNER_RECORDS)

    if "risk" in normalized or "escalation" in normalized:
        return sorted(
            [record for record in LEARNER_RECORDS if record.risk_score >= 70],
            key=lambda record: record.risk_score,
            reverse=True,
        )

    if "recommend" in normalized:
        return [record for record in LEARNER_RECORDS if record.status != "complete"]

    return [record for record in LEARNER_RECORDS if record.status != "complete"]


def summarize(records: list[LearnerRecord], template: QueryTemplate) -> str:
    overdue = sum(1 for record in records if record.status == "overdue")
    review = sum(1 for record in records if record.status == "under-review")
    escalation = sum(1 for record in records if record.escalation != "none")

    if template.intent == "communications":
        return (
            f"{len(records)} learners need manager-reviewed outreach. "
            f"{review} are frozen by dispute or eligibility review; "
            f"{escalation} have an escalation rung ready after approval."
        )

    if template.intent == "recommendations":
        return (
            f"{len(records)} learners have course gaps. Cohere Embeddings v3 feeds "
            "Oracle Database 23ai AI Vector Search to rank replacement learning."
        )

    if template.intent == "risk":
        return (
            f"{len(records)} high-risk records found. {overdue} are overdue and "
            f"{review} require human review before any notification is sent."
        )

    return (
        f"{len(records)} learners require attention. {overdue} are overdue, "
        f"{review} are under review, and every row includes policy citations for audit readiness."
    )


def _build_trace(
    records: list[LearnerRecord],
    ranked_recommendations: list[CourseRecommendation],
) -> list[dict[str, str]]:
    return [
        _trace_step(
            step_id="supervisor",
            agent="Compliance Supervisor",
            platform=ORACLE_AGENT_STACK["orchestration_provider"],
            model_or_service=ORACLE_AGENT_STACK["supervisor_model"],
            action="Planned bounded agent workflow",
            status="passed",
            details=(
                "Oracle AI Agent Studio coordinates HCM Data, Compliance Analyzer, "
                "Notification, and Course Recommender agents."
            ),
        ),
        _trace_step(
            step_id="hcm-data",
            agent="HCM Data Agent",
            platform="HCM REST APIs + Business Object Tool",
            model_or_service="Cohere Command R+",
            action="Projected learner compliance fields",
            status="passed",
            details=(
                f"{len(records)} eligible learner records remain after leave, transfer, "
                "dispute, and grace-period filtering."
            ),
        ),
        _trace_step(
            step_id="embedding",
            agent="Document Tool Embedding Job",
            platform=ORACLE_AGENT_STACK["embedding_provider"],
            model_or_service=ORACLE_AGENT_STACK["embedding_model"],
            action="Embedded manager query and catalog chunks",
            status="passed",
            details="Cohere Embed via OCI Generative AI service provides the vector representation.",
        ),
        _trace_step(
            step_id="vector-search",
            agent="Course Recommender",
            platform=ORACLE_AGENT_STACK["vector_provider"],
            model_or_service=ORACLE_AGENT_STACK["embedding_model"],
            action="Retrieved ranked learning matches",
            status="passed",
            details=(
                f"{len(ranked_recommendations)} course recommendations returned from "
                "the simulated Oracle 23ai vector index."
            ),
        ),
        _trace_step(
            step_id="evaluation",
            agent="Evaluation Gate",
            platform=ORACLE_AGENT_STACK["evaluation_provider"],
            model_or_service="LLM judge + golden dataset",
            action="Scored faithfulness, relevance, and citation coverage",
            status="passed",
            details="Agent Studio evaluation gate is represented before deployment approval.",
        ),
    ]


def _trace_step(
    step_id: str,
    agent: str,
    platform: str,
    model_or_service: str,
    action: str,
    status: str,
    details: str,
) -> dict[str, str]:
    return {
        "id": step_id,
        "agent": agent,
        "platform": platform,
        "modelOrService": model_or_service,
        "action": action,
        "status": status,
        "details": details,
    }


def _rank_recommendations(vector_matches: list[VectorSearchResult]) -> list[CourseRecommendation]:
    ranked: list[CourseRecommendation] = []

    for match in vector_matches:
        course = next((item for item in RECOMMENDATIONS if item.course_id == match.course_id), None)
        if not course:
            continue

        ranked.append(
            CourseRecommendation(
                course_id=course.course_id,
                title=course.title,
                match_reason=f"{course.match_reason} {match.reason}.",
                audience=course.audience,
                duration=course.duration,
                confidence=round(match.score * 100),
            )
        )

    return ranked


def _find_template(template_id: str) -> QueryTemplate:
    return next((template for template in QUERY_TEMPLATES if template.id == template_id), QUERY_TEMPLATES[0])


def _build_cache_key(query: str, template: QueryTemplate) -> str:
    return f"{template.id}:{query.strip().lower()}"


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
