# Requirements Traceability Matrix

This matrix maps product, architecture, runtime, test, and documentation requirements to implementation files, test files, automation checks, and supporting documentation.

## Matrix

| Requirement ID | Requirement | Implementation file | Test file | Automation check | Documentation reference |
| --- | --- | --- | --- | --- | --- |
| REQ-001 | React.js manager UI for login, query input, compliance results, recommendations, guardrails, and trace display | `app/page.tsx`, `app/globals.css`, `app/layout.tsx` | `tests/rendered-html.test.mjs` | `pnpm test` | `README.md`, `docs/oracle-agentic-runtime.md` |
| REQ-002 | Python backend owns the agentic AI runtime; TypeScript API route must remain a thin proxy only | `backend/server.py`, `backend/agentic/runtime.py`, `app/api/agentic-query/route.ts` | `tests/rendered-html.test.mjs`, `backend/tests/test_runtime.py` | `pnpm test` | `README.md`, `docs/oracle-agentic-runtime.md` |
| REQ-003 | Agentic query endpoint accepts manager prompt, query template, and manager email | `backend/server.py`, `app/api/agentic-query/route.ts` | `backend/tests/test_runtime.py` | `PYTHONPATH=backend python3 -m unittest discover -s backend/tests` | `docs/oracle-agentic-runtime.md`, `docs/agent-runs/README.md` |
| REQ-004 | Cohere Command R+ is represented as the supervisor and generation model | `backend/agentic/config.py`, `backend/agentic/providers.py`, `backend/agentic/runtime.py` | `backend/tests/test_runtime.py` | `pnpm test` | `README.md`, `docs/agent-runs/2026-07-19T235232Z-01-compliance-supervisor.md` |
| REQ-005 | Cohere Embeddings v3 is represented as the embedding model through OCI Generative AI service | `backend/agentic/config.py`, `backend/agentic/providers.py` | `backend/tests/test_runtime.py`, `tests/rendered-html.test.mjs` | `pnpm test` | `docs/agent-runs/2026-07-19T235232Z-03-document-embedding-job.md` |
| REQ-006 | Oracle Database 23ai AI Vector Search boundary exists for recommendation retrieval | `backend/agentic/providers.py`, `backend/agentic/runtime.py` | `backend/tests/test_runtime.py`, `tests/rendered-html.test.mjs` | `pnpm test` | `docs/agent-runs/2026-07-19T235232Z-04-course-recommender-vector-search.md` |
| REQ-007 | Oracle Coherence semantic cache boundary exists with hit/miss semantics | `backend/agentic/providers.py`, `backend/agentic/runtime.py` | `backend/tests/test_runtime.py` | `PYTHONPATH=backend python3 -m unittest discover -s backend/tests` | `docs/oracle-agentic-runtime.md`, `docs/agent-runs/2026-07-19T235232Z-01-compliance-supervisor.md` |
| REQ-008 | Oracle AI Agent Studio is represented as orchestration framework | `backend/agentic/config.py`, `backend/agentic/providers.py`, `backend/agentic/runtime.py` | `backend/tests/test_runtime.py`, `tests/rendered-html.test.mjs` | `pnpm test` | `docs/oracle-agentic-runtime.md`, `docs/agent-runs/2026-07-19T235232Z-01-compliance-supervisor.md` |
| REQ-009 | Agent Studio evaluation framework scores faithfulness, relevance, citation coverage, and deployment gate | `backend/agentic/providers.py`, `backend/agentic/runtime.py` | `backend/tests/test_runtime.py` | `pnpm test` | `docs/agent-runs/2026-07-19T235232Z-05-evaluation-gate.md` |
| REQ-010 | HCM Data Agent returns high-risk learner records with status, risk score, escalation, reason, and citations | `backend/agentic/data.py`, `backend/agentic/runtime.py` | `backend/tests/test_runtime.py`, `tests/rendered-html.test.mjs` | `pnpm test` | `docs/agent-runs/2026-07-19T235232Z-02-hcm-data-agent.md` |
| REQ-011 | Human approval gate appears before staged outreach | `app/page.tsx` | `tests/rendered-html.test.mjs` | `pnpm test` | `README.md`, `docs/agent-runs/2026-07-19T235232Z-05-evaluation-gate.md` |
| REQ-012 | Architecture diagram is included and rendered from repository assets | `public/compliance_multiagent_architecture_v6_unified.svg`, `app/page.tsx` | `tests/rendered-html.test.mjs` | `pnpm test` | `README.md` |
| REQ-013 | Docker runtime supports both React UI and Python backend services | `Dockerfile`, `backend/Dockerfile`, `docker-compose.yml` | `scripts/functional-smoke.mjs` | `pnpm run validate:compose`, `docker compose build`, `docker compose up -d`, `pnpm run test:functional` | `README.md`, `docs/oracle-agentic-runtime.md` |
| REQ-014 | Public demo runs without Oracle credentials by using mock mode | `backend/agentic/config.py`, `backend/agentic/providers.py`, `docker-compose.yml` | `backend/tests/test_runtime.py` | `pnpm test` | `README.md`, `docs/oracle-agentic-runtime.md` |
| REQ-015 | Live Oracle deployment contract is documented without committing secrets | `backend/agentic/config.py` | Documentation review | `rg "OCI_COMPARTMENT_ID|ORACLE_AGENTIC_PROVIDER" README.md docs backend` | `docs/oracle-agentic-runtime.md`, `README.md` |
| REQ-016 | Agent execution logs exist for each agent/runtime step | `docs/agent-runs/*.md` | Documentation file listing | `find docs/agent-runs -maxdepth 1 -type f -print` | `docs/agent-runs/README.md` |
| REQ-017 | Seeded test data remains deterministic and auditable | `app/data.ts`, `backend/agentic/data.py` | `tests/rendered-html.test.mjs`, `backend/tests/test_runtime.py` | `pnpm test` | `README.md`, `docs/agent-runs/2026-07-19T235232Z-02-hcm-data-agent.md` |
| REQ-018 | Backend health endpoint exists for service readiness checks | `backend/server.py` | Docker/manual smoke check | `curl -s http://localhost:8000/health` | `README.md`, `docs/oracle-agentic-runtime.md` |
| REQ-019 | Frontend proxy targets Python backend through environment configuration | `app/api/agentic-query/route.ts`, `docker-compose.yml` | `tests/rendered-html.test.mjs` | `pnpm test`, `curl -s -X POST http://localhost:3000/api/agentic-query ...` | `docs/oracle-agentic-runtime.md` |
| REQ-020 | Repository preserves build, lint, coverage, functional, compose, and combined test automation | `package.json`, `scripts/functional-smoke.mjs`, `scripts/publish-coverage.mjs`, `tests/rendered-html.test.mjs`, `backend/tests/test_runtime.py` | `tests/rendered-html.test.mjs`, `backend/tests/test_runtime.py`, `scripts/functional-smoke.mjs` | `pnpm run build:backend`, `pnpm run lint`, `pnpm run build`, `pnpm test`, `pnpm run coverage`, `pnpm run validate:compose`, `pnpm run test:functional` | `README.md` |

## Automation Command Reference

Run lint:

```bash
pnpm run lint
```

Run production build:

```bash
pnpm run build
```

Run combined frontend and Python backend tests:

```bash
pnpm test
```

Run Python backend tests only:

```bash
PYTHONPATH=backend python3 -m unittest discover -s backend/tests
```

Build and run both services with Docker:

```bash
docker compose up --build
```

Smoke test the React UI:

```bash
curl -I http://localhost:3000/
```

Smoke test the Python backend:

```bash
curl -s http://localhost:8000/health
```

Smoke test the React-to-Python proxy:

```bash
curl -s -X POST http://localhost:3000/api/agentic-query \
  -H 'content-type: application/json' \
  -d '{"query":"Show overdue learners with escalation risk and policy citations.","templateId":"high-risk","managerEmail":"asha.mehta@example.com"}'
```
