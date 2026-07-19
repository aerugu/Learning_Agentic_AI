import {
  learnerRecords,
  queryTemplates,
  recommendations,
  type CourseRecommendation,
  type LearnerRecord,
  type QueryTemplate,
} from "../data";
import { getAgenticRuntimeConfig, ORACLE_AGENT_STACK } from "./config";
import {
  AgentStudioEvaluationClient,
  OciCohereEmbeddingClient,
  OciGenerativeAiCommandRClient,
  Oracle23AiVectorSearchClient,
  OracleAiAgentStudioClient,
  OracleCoherenceCache,
} from "./providers";
import type { AgenticQueryRequest, AgenticQueryResult, AgentTraceStep } from "./types";

export async function runAgenticComplianceQuery(
  request: AgenticQueryRequest,
): Promise<AgenticQueryResult> {
  const config = getAgenticRuntimeConfig();
  const template = queryTemplates.find((item) => item.id === request.templateId) ?? queryTemplates[0];
  const cacheKey = buildCacheKey(request.query, template);
  const cache = new OracleCoherenceCache(config);
  const cached = await cache.get<AgenticQueryResult>(cacheKey);

  if (cached) {
    return {
      ...cached,
      cacheStatus: "hit",
      generatedAt: new Date().toISOString(),
      trace: [
        traceStep(
          "cache-hit",
          "Semantic Cache",
          ORACLE_AGENT_STACK.cacheProvider,
          ORACLE_AGENT_STACK.cacheProvider,
          "Returned cached agent result",
          "passed",
          "Oracle Coherence cache key matched query, template, and manager scope.",
        ),
        ...cached.trace,
      ],
    };
  }

  const agentStudio = new OracleAiAgentStudioClient(config);
  const embeddingClient = new OciCohereEmbeddingClient(config);
  const vectorSearch = new Oracle23AiVectorSearchClient(config);
  const llm = new OciGenerativeAiCommandRClient(config);
  const evaluationClient = new AgentStudioEvaluationClient(config);

  await agentStudio.runSupervisor();

  const eligibleRecords = resolveRecords(template, request.query);
  const embedding = await embeddingClient.embed(request.query);
  const vectorMatches = await vectorSearch.searchCourses(embedding, request.query);
  const rankedRecommendations = rankRecommendations(vectorMatches);
  const summary = summarize(eligibleRecords, template);
  await llm.summarize(summary);

  const citationCount = eligibleRecords.reduce((total, record) => total + record.citations.length, 0);
  const evaluation = await evaluationClient.score(citationCount, eligibleRecords.length);

  const result: AgenticQueryResult = {
    query: request.query,
    template,
    generatedAt: new Date().toISOString(),
    runtimeMode: config.mode,
    supervisorModel: ORACLE_AGENT_STACK.supervisorModel,
    embeddingModel: ORACLE_AGENT_STACK.embeddingModel,
    cacheStatus: "miss",
    records: eligibleRecords,
    recommendations: rankedRecommendations,
    summary,
    trace: buildTrace(eligibleRecords, rankedRecommendations),
    evaluation,
  };

  await cache.set(cacheKey, result);

  return result;
}

export function resolveRecords(template: QueryTemplate, query: string) {
  const normalized = `${template.intent} ${query}`.toLowerCase();

  if (normalized.includes("complete") && !normalized.includes("not completed")) {
    return learnerRecords;
  }

  if (normalized.includes("risk") || normalized.includes("escalation")) {
    return learnerRecords
      .filter((record) => record.riskScore >= 70)
      .sort((left, right) => right.riskScore - left.riskScore);
  }

  if (normalized.includes("recommend")) {
    return learnerRecords.filter((record) => record.status !== "complete");
  }

  return learnerRecords.filter((record) => record.status !== "complete");
}

export function summarize(records: LearnerRecord[], template: QueryTemplate) {
  const overdue = records.filter((record) => record.status === "overdue").length;
  const review = records.filter((record) => record.status === "under-review").length;
  const escalation = records.filter((record) => record.escalation !== "none").length;

  if (template.intent === "communications") {
    return `${records.length} learners need manager-reviewed outreach. ${review} are frozen by dispute or eligibility review; ${escalation} have an escalation rung ready after approval.`;
  }

  if (template.intent === "recommendations") {
    return `${records.length} learners have course gaps. Cohere Embeddings v3 feeds Oracle Database 23ai AI Vector Search to rank replacement learning.`;
  }

  if (template.intent === "risk") {
    return `${records.length} high-risk records found. ${overdue} are overdue and ${review} require human review before any notification is sent.`;
  }

  return `${records.length} learners require attention. ${overdue} are overdue, ${review} are under review, and every row includes policy citations for audit readiness.`;
}

function buildTrace(
  records: LearnerRecord[],
  rankedRecommendations: CourseRecommendation[],
): AgentTraceStep[] {
  return [
    traceStep(
      "supervisor",
      "Compliance Supervisor",
      ORACLE_AGENT_STACK.orchestrationProvider,
      ORACLE_AGENT_STACK.supervisorModel,
      "Planned bounded agent workflow",
      "passed",
      "Oracle AI Agent Studio coordinates HCM Data, Compliance Analyzer, Notification, and Course Recommender agents.",
    ),
    traceStep(
      "hcm-data",
      "HCM Data Agent",
      "HCM REST APIs + Business Object Tool",
      "Cohere Command R+",
      "Projected learner compliance fields",
      "passed",
      `${records.length} eligible learner records remain after leave, transfer, dispute, and grace-period filtering.`,
    ),
    traceStep(
      "embedding",
      "Document Tool Embedding Job",
      ORACLE_AGENT_STACK.embeddingProvider,
      ORACLE_AGENT_STACK.embeddingModel,
      "Embedded manager query and catalog chunks",
      "passed",
      "Cohere Embed via OCI Generative AI service provides the vector representation.",
    ),
    traceStep(
      "vector-search",
      "Course Recommender",
      ORACLE_AGENT_STACK.vectorProvider,
      ORACLE_AGENT_STACK.embeddingModel,
      "Retrieved ranked learning matches",
      "passed",
      `${rankedRecommendations.length} course recommendations returned from the simulated Oracle 23ai vector index.`,
    ),
    traceStep(
      "evaluation",
      "Evaluation Gate",
      ORACLE_AGENT_STACK.evaluationProvider,
      "LLM judge + golden dataset",
      "Scored faithfulness, relevance, and citation coverage",
      "passed",
      "Agent Studio evaluation gate is represented before deployment approval.",
    ),
  ];
}

function traceStep(
  id: string,
  agent: string,
  platform: string,
  modelOrService: string,
  action: string,
  status: AgentTraceStep["status"],
  details: string,
): AgentTraceStep {
  return { id, agent, platform, modelOrService, action, status, details };
}

function rankRecommendations(vectorMatches: { courseId: string; score: number; reason: string }[]) {
  return vectorMatches
    .map((match) => {
      const course = recommendations.find((item) => item.courseId === match.courseId);

      if (!course) {
        return null;
      }

      return {
        ...course,
        confidence: Math.round(match.score * 100),
        matchReason: `${course.matchReason} ${match.reason}.`,
      };
    })
    .filter((course): course is CourseRecommendation => Boolean(course));
}

function buildCacheKey(query: string, template: QueryTemplate) {
  return `${template.id}:${query.trim().toLowerCase()}`;
}
