import type { AgentRuntimeMode } from "./types";

export const ORACLE_AGENT_STACK = {
  supervisorModel: "cohere.command-r-plus",
  embeddingModel: "cohere.embed-english-v3.0",
  embeddingProvider: "OCI Generative AI service",
  llmProvider: "OCI Generative AI service",
  cacheProvider: "Oracle Coherence",
  vectorProvider: "Oracle Database 23ai AI Vector Search",
  orchestrationProvider: "Oracle AI Agent Studio",
  evaluationProvider: "Agent Studio built-in evaluation framework",
} as const;

export type AgenticRuntimeConfig = {
  mode: AgentRuntimeMode;
  ociGenerativeAiEndpoint?: string;
  ociAgentStudioEndpoint?: string;
  oracle23aiVectorSearchEndpoint?: string;
  oracleCoherenceEndpoint?: string;
  oracleCompartmentId?: string;
};

export function getAgenticRuntimeConfig(): AgenticRuntimeConfig {
  const requestedMode = process.env.ORACLE_AGENTIC_PROVIDER === "oci" ? "oci" : "mock";

  return {
    mode: requestedMode,
    ociGenerativeAiEndpoint: process.env.OCI_GENERATIVE_AI_ENDPOINT,
    ociAgentStudioEndpoint: process.env.ORACLE_AI_AGENT_STUDIO_ENDPOINT,
    oracle23aiVectorSearchEndpoint: process.env.ORACLE_23AI_VECTOR_SEARCH_ENDPOINT,
    oracleCoherenceEndpoint: process.env.ORACLE_COHERENCE_ENDPOINT,
    oracleCompartmentId: process.env.OCI_COMPARTMENT_ID,
  };
}

export function hasLiveOracleConfig(config: AgenticRuntimeConfig) {
  return Boolean(
    config.ociGenerativeAiEndpoint &&
      config.ociAgentStudioEndpoint &&
      config.oracle23aiVectorSearchEndpoint &&
      config.oracleCoherenceEndpoint &&
      config.oracleCompartmentId,
  );
}
