# Oracle Agentic Runtime Design

This project now separates the React manager UI from the agentic runtime. The UI calls `POST /api/agentic-query`; the server route runs a provider-based orchestration layer that can operate in two modes:

- `mock`: default, fully runnable without Oracle credentials.
- `oci`: intended live mode once OCI request signing, Oracle Database credentials, Coherence endpoint auth, and Agent Studio API binding are configured.

## Runtime Components

| Component | Implementation file | Target Oracle service |
| --- | --- | --- |
| Supervisor orchestration | `app/agentic/runtime.ts` | Oracle AI Agent Studio |
| LLM generation | `OciGenerativeAiCommandRClient` | Cohere Command R+ through OCI Generative AI service |
| Embeddings | `OciCohereEmbeddingClient` | Cohere Embeddings v3 through OCI Generative AI service |
| Semantic cache | `OracleCoherenceCache` | Oracle Coherence |
| Vector retrieval | `Oracle23AiVectorSearchClient` | Oracle Database 23ai AI Vector Search |
| Evaluation gate | `AgentStudioEvaluationClient` | Agent Studio built-in evaluation framework |

## Request Flow

1. React manager UI submits a query to `/api/agentic-query`.
2. API validates `query`, `templateId`, and `managerEmail`.
3. Runtime checks Oracle Coherence semantic cache.
4. Oracle AI Agent Studio supervisor plans the bounded workflow.
5. HCM Data Agent applies eligibility and compliance filters.
6. Cohere Embed v3 creates the query embedding through OCI Generative AI.
7. Oracle Database 23ai AI Vector Search ranks learning recommendations.
8. Cohere Command R+ produces a grounded summary.
9. Agent Studio evaluation scores faithfulness, relevance, and citation coverage.
10. API returns records, recommendations, trace steps, model metadata, cache status, and evaluation status.

## Environment Contract

Live `oci` mode should be enabled with these variables:

```bash
ORACLE_AGENTIC_PROVIDER=oci
OCI_COMPARTMENT_ID=<oci-compartment-ocid>
OCI_GENERATIVE_AI_ENDPOINT=<oci-generative-ai-endpoint>
ORACLE_AI_AGENT_STUDIO_ENDPOINT=<agent-studio-endpoint>
ORACLE_23AI_VECTOR_SEARCH_ENDPOINT=<oracle-23ai-vector-search-endpoint>
ORACLE_COHERENCE_ENDPOINT=<oracle-coherence-endpoint>
```

The current repository intentionally does not include secrets, wallets, private keys, or tenancy-specific endpoint values.

## Live Adapter Work Still Required

The provider classes are ready boundaries, but live service calls still need:

- OCI request signing.
- Oracle AI Agent Studio endpoint contract.
- Oracle Database 23ai connection and vector SQL/query implementation.
- Oracle Coherence auth and cache client.
- Agent Studio evaluation API binding.
- Production HCM REST and Business Object Tool integration.

Until those are supplied, the app stays in `mock` mode and returns deterministic enterprise-style results for demos and tests.
