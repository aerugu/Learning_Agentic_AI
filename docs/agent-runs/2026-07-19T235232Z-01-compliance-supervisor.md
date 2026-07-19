# Compliance Supervisor Run

Timestamp: `2026-07-19T23:52:32Z`

Agent: `Compliance Supervisor`

Platform: `Oracle AI Agent Studio`

Model or service: `cohere.command-r-plus`

## Input Prompt

```text
Show overdue learners with escalation risk and policy citations.
```

Request context:

```json
{
  "templateId": "high-risk",
  "managerEmail": "asha.mehta@example.com",
  "runtimeMode": "mock"
}
```

## Agent Output

The supervisor selected the high-risk compliance workflow and planned a bounded agent sequence:

1. Check Oracle Coherence semantic cache.
2. Run HCM Data Agent eligibility and roster projection.
3. Generate query embedding with Cohere Embed v3 via OCI Generative AI.
4. Retrieve course matches through Oracle Database 23ai AI Vector Search.
5. Summarize findings with Cohere Command R+.
6. Score the result with Agent Studio evaluation framework.

Trace detail returned by the backend:

```text
Oracle AI Agent Studio coordinates HCM Data, Compliance Analyzer, Notification, and Course Recommender agents.
```

## Human Decision

Approved the supervisor plan for implementation because it keeps the React UI separate from the Python agentic backend and preserves the requested Oracle/Cohere stack boundaries.

## Code, Doc, Or Test Artifact Produced

- `backend/agentic/runtime.py`
- `backend/agentic/config.py`
- `docs/oracle-agentic-runtime.md`
- `tests/rendered-html.test.mjs`

## Validation Command

```bash
pnpm test
```

Additional runtime validation:

```bash
curl -s -X POST http://localhost:3000/api/agentic-query \
  -H 'content-type: application/json' \
  -d '{"query":"Show overdue learners with escalation risk and policy citations.","templateId":"high-risk","managerEmail":"asha.mehta@example.com"}'
```
