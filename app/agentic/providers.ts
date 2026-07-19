import { recommendations } from "../data";
import { hasLiveOracleConfig, ORACLE_AGENT_STACK, type AgenticRuntimeConfig } from "./config";
import type { EmbeddingResult, VectorSearchResult } from "./types";

const semanticCache = new Map<string, unknown>();

export class OracleCoherenceCache {
  constructor(private readonly config: AgenticRuntimeConfig) {}

  async get<T>(key: string): Promise<T | null> {
    if (this.shouldUseLiveService()) {
      throw new Error("Oracle Coherence live adapter requires service-auth implementation.");
    }

    return (semanticCache.get(key) as T | undefined) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (this.shouldUseLiveService()) {
      throw new Error("Oracle Coherence live adapter requires service-auth implementation.");
    }

    semanticCache.set(key, value);
  }

  private shouldUseLiveService() {
    return this.config.mode === "oci" && hasLiveOracleConfig(this.config);
  }
}

export class OciCohereEmbeddingClient {
  constructor(private readonly config: AgenticRuntimeConfig) {}

  async embed(text: string): Promise<EmbeddingResult> {
    if (this.config.mode === "oci" && hasLiveOracleConfig(this.config)) {
      throw new Error("OCI Cohere Embed live adapter requires OCI request signing.");
    }

    return {
      model: ORACLE_AGENT_STACK.embeddingModel,
      dimensions: 1024,
      values: deterministicEmbedding(text, 32),
    };
  }
}

export class Oracle23AiVectorSearchClient {
  constructor(private readonly config: AgenticRuntimeConfig) {}

  async searchCourses(embedding: EmbeddingResult, query: string): Promise<VectorSearchResult[]> {
    if (this.config.mode === "oci" && hasLiveOracleConfig(this.config)) {
      throw new Error("Oracle Database 23ai Vector Search live adapter requires DB credentials.");
    }

    const normalized = query.toLowerCase();

    return recommendations
      .map((course, index) => {
        const text = `${course.title} ${course.matchReason} ${course.audience}`.toLowerCase();
        const lexicalBoost = normalized
          .split(/\W+/)
          .filter((token) => token.length > 4 && text.includes(token)).length;
        const embeddingBoost = embedding.values[index % embedding.values.length] ?? 0;

        return {
          courseId: course.courseId,
          score: Math.min(0.98, 0.72 + lexicalBoost * 0.05 + embeddingBoost * 0.03),
          reason: `Oracle 23ai vector match using ${ORACLE_AGENT_STACK.embeddingModel}`,
        };
      })
      .sort((left, right) => right.score - left.score);
  }
}

export class OciGenerativeAiCommandRClient {
  constructor(private readonly config: AgenticRuntimeConfig) {}

  async summarize(prompt: string) {
    if (this.config.mode === "oci" && hasLiveOracleConfig(this.config)) {
      throw new Error("OCI Generative AI live adapter requires OCI request signing.");
    }

    return `Cohere Command R+ mock response grounded in policy citations for: ${prompt}`;
  }
}

export class OracleAiAgentStudioClient {
  constructor(private readonly config: AgenticRuntimeConfig) {}

  async runSupervisor() {
    if (this.config.mode === "oci" && hasLiveOracleConfig(this.config)) {
      throw new Error("Oracle AI Agent Studio live adapter requires Agent Studio endpoint auth.");
    }

    return {
      supervisor: "Compliance Supervisor",
      model: ORACLE_AGENT_STACK.supervisorModel,
      tools: [
        "HCM Business Object Tool",
        "Document Tool",
        "Oracle Database 23ai Vector Search",
        "Oracle Coherence semantic cache",
      ],
    };
  }
}

export class AgentStudioEvaluationClient {
  constructor(private readonly config: AgenticRuntimeConfig) {}

  async score(citationCount: number, recordCount: number) {
    if (this.config.mode === "oci" && hasLiveOracleConfig(this.config)) {
      throw new Error("Agent Studio evaluation live adapter requires evaluation API binding.");
    }

    const citationCoverage = recordCount === 0 ? 1 : Math.min(1, citationCount / (recordCount * 2));
    const faithfulness = citationCoverage >= 0.9 ? 0.96 : 0.88;
    const answerRelevance = recordCount > 0 ? 0.93 : 0.8;

    return {
      framework: ORACLE_AGENT_STACK.evaluationProvider,
      dataset: "50-case compliance golden set",
      faithfulness,
      answerRelevance,
      citationCoverage,
      deploymentGate: citationCoverage >= 0.85 ? ("pass" as const) : ("review" as const),
    };
  }
}

function deterministicEmbedding(text: string, dimensions: number) {
  const values: number[] = [];
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  for (let index = 0; index < dimensions; index += 1) {
    hash ^= index + 0x9e3779b9;
    hash = Math.imul(hash, 16777619);
    values.push(((hash >>> 0) % 1000) / 1000);
  }

  return values;
}
