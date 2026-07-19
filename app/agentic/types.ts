import type { CourseRecommendation, LearnerRecord, QueryTemplate } from "../data";

export type AgentRuntimeMode = "mock" | "oci";

export type AgenticQueryRequest = {
  query: string;
  templateId: string;
  managerEmail: string;
};

export type AgenticQueryResult = {
  query: string;
  template: QueryTemplate;
  generatedAt: string;
  runtimeMode: AgentRuntimeMode;
  supervisorModel: string;
  embeddingModel: string;
  cacheStatus: "hit" | "miss" | "bypass";
  records: LearnerRecord[];
  recommendations: CourseRecommendation[];
  summary: string;
  trace: AgentTraceStep[];
  evaluation: AgentEvaluation;
};

export type AgentTraceStep = {
  id: string;
  agent: string;
  platform: string;
  modelOrService: string;
  action: string;
  status: "passed" | "review" | "blocked";
  details: string;
};

export type AgentEvaluation = {
  framework: string;
  dataset: string;
  faithfulness: number;
  answerRelevance: number;
  citationCoverage: number;
  deploymentGate: "pass" | "review" | "fail";
};

export type EmbeddingResult = {
  model: string;
  dimensions: number;
  values: number[];
};

export type VectorSearchResult = {
  courseId: string;
  score: number;
  reason: string;
};
