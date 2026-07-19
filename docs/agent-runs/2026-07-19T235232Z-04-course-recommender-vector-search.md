# Course Recommender Vector Search Run

Timestamp: `2026-07-19T23:52:32Z`

Agent: `Course Recommender`

Platform: `Oracle Database 23ai AI Vector Search`

Model or service: `cohere.embed-english-v3.0`

## Input Prompt

```text
Retrieve replacement learning for high-risk compliance gaps using query embedding.
```

## Agent Output

The vector search provider returned three ranked recommendations:

| Course | Confidence | Retrieval explanation |
| --- | ---: | --- |
| Anti-Bribery Essentials: Field Scenarios | 79% | Oracle 23ai vector match using cohere.embed-english-v3.0 |
| Secure Development Lifecycle: Applied Controls | 74% | Oracle 23ai vector match using cohere.embed-english-v3.0 |
| Data Privacy Refresher for Finance Teams | 72% | Oracle 23ai vector match using cohere.embed-english-v3.0 |

Trace detail returned by the backend:

```text
3 course recommendations returned from the simulated Oracle 23ai vector index.
```

## Human Decision

Accepted the ranking for demo use. In live mode, replace the deterministic ranking with Oracle Database 23ai vector SQL over policy and learning catalog embeddings.

## Code, Doc, Or Test Artifact Produced

- `backend/agentic/providers.py`
- `backend/agentic/runtime.py`
- `app/page.tsx`

## Validation Command

```bash
docker compose up --build
```

Runtime check:

```bash
curl -s -X POST http://localhost:3000/api/agentic-query \
  -H 'content-type: application/json' \
  -d '{"query":"Show overdue learners with escalation risk and policy citations.","templateId":"high-risk","managerEmail":"asha.mehta@example.com"}'
```
