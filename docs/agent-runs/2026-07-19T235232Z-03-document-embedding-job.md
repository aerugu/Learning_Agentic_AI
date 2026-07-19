# Document Tool Embedding Job Run

Timestamp: `2026-07-19T23:52:32Z`

Agent: `Document Tool Embedding Job`

Platform: `OCI Generative AI service`

Model or service: `cohere.embed-english-v3.0`

## Input Prompt

```text
Embed manager query for semantic retrieval:
Show overdue learners with escalation risk and policy citations.
```

## Agent Output

The embedding provider returned a deterministic mock embedding shaped like the live Cohere Embed v3 response contract:

```json
{
  "model": "cohere.embed-english-v3.0",
  "dimensions": 1024,
  "runtimeMode": "mock"
}
```

Trace detail returned by the backend:

```text
Cohere Embed via OCI Generative AI service provides the vector representation.
```

## Human Decision

Approved mock embeddings for the public demo because OCI credentials and tenancy-specific endpoints should not be committed. The provider boundary is ready for OCI request signing later.

## Code, Doc, Or Test Artifact Produced

- `backend/agentic/providers.py`
- `backend/agentic/config.py`
- `docs/oracle-agentic-runtime.md`

## Validation Command

```bash
pnpm test
```
