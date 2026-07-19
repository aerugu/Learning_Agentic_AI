# Oracle Fusion Learning Agentic AI

Manager-facing React application for exploring Oracle Fusion HCM Learning compliance queries with seeded enterprise test data. The UI demonstrates a multi-agent compliance workflow backed by a RAG retrieval substrate: manager query intake, learner eligibility findings, policy citations, course recommendations, guardrail status, and approval-gated outreach.

## Features

- Manager login screen with demo local auth state
- Query composer with reusable compliance, risk, recommendation, and notification prompts
- Seeded learner records with departments, due dates, escalation rung, risk score, reasons, and citations
- Course recommendation cards with vector match explanations
- Guardrail checklist aligned to the multi-agent architecture
- Responsive enterprise dashboard UI built with React and Next-compatible vinext
- Render tests that validate the production HTML output

## Prerequisites

- Node.js `>=22.13.0`
- pnpm

## Run Locally

```bash
pnpm install
pnpm run dev
```

The development server prints a local URL. Open it in a browser to use the manager console.

## Run With Docker

Build and start the production container:

```bash
docker compose up --build
```

Then open `http://localhost:3000`.

To stop the app:

```bash
docker compose down
```

## Test And Build

```bash
pnpm run build
pnpm test
```

`pnpm test` builds the app and verifies the rendered HTML contains the manager workflow, sample records, citations, recommendations, and copied architecture asset.

## Test Data

The seeded data lives in `app/data.ts`:

- `queryTemplates`: reusable manager queries
- `learnerRecords`: demo Oracle Fusion learner compliance records
- `recommendations`: course matches returned by the simulated RAG recommender
- `guardrails`: active controls shown in the UI

Replace these exports with API calls when connecting to real Oracle Fusion HCM, vector search, notification, or orchestration services.

## Deployment Notes

This project uses the Sites-compatible vinext structure and includes `.openai/hosting.json`. It can be built locally with `npm run build` and published to a Git repository for future reference.

Suggested public Git flow:

```bash
git add .
git commit -m "Build Oracle Fusion learning compliance manager UI"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

Use a private repository until you remove or replace any proprietary sample data, diagrams, credentials, or customer-specific details.
