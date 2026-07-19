# Agent Run Logs

This directory captures a repeatable AI workflow trail for the Oracle Fusion Learning Agentic AI application.

Run timestamp: `2026-07-19T23:52:32Z`

Canonical test prompt:

```text
Show overdue learners with escalation risk and policy citations.
```

Canonical request:

```json
{
  "query": "Show overdue learners with escalation risk and policy citations.",
  "templateId": "high-risk",
  "managerEmail": "asha.mehta@example.com"
}
```

Runtime mode: `mock`

The current backend is Python and lives under `backend/agentic/`. These logs document the same agent steps returned by `backend/agentic/runtime.py`.

## Files

- `2026-07-19T235232Z-01-compliance-supervisor.md`
- `2026-07-19T235232Z-02-hcm-data-agent.md`
- `2026-07-19T235232Z-03-document-embedding-job.md`
- `2026-07-19T235232Z-04-course-recommender-vector-search.md`
- `2026-07-19T235232Z-05-evaluation-gate.md`

## Reproduce

Run all validation:

```bash
pnpm test
```

Run the Docker stack:

```bash
docker compose up --build
```

Call the Python backend through the React proxy:

```bash
curl -s -X POST http://localhost:3000/api/agentic-query \
  -H 'content-type: application/json' \
  -d '{"query":"Show overdue learners with escalation risk and policy citations.","templateId":"high-risk","managerEmail":"asha.mehta@example.com"}'
```
