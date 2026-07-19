import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function fetchWorker(path = "/", init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
      ...init,
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the manager compliance console", async () => {
  const response = await fetchWorker();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Oracle Fusion Learning Compliance Manager<\/title>/i);
  assert.match(html, /Manager compliance command center/);
  assert.match(html, /Manager query/);
  assert.match(html, /Run agent team/);
  assert.match(html, /Approve staged outreach/);
  assert.match(html, /Maya Chen/);
  assert.match(html, /POL-DP-014/);
  assert.match(html, /Cohere Command R\+/);
  assert.match(html, /Cohere Embed v3/);
  assert.match(html, /Oracle Database 23ai/);
  assert.match(html, /Oracle AI Agent Studio trace/);
  assert.match(html, /Unified multi-agent compliance and RAG architecture/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("agentic query API returns Oracle and Cohere runtime metadata", async () => {
  const response = await fetchWorker("/api/agentic-query", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: "Show overdue learners with escalation risk and policy citations.",
      templateId: "high-risk",
      managerEmail: "asha.mehta@example.com",
    }),
  });

  assert.equal(response.status, 200);
  const body = await response.json();

  assert.equal(body.runtimeMode, "mock");
  assert.equal(body.supervisorModel, "cohere.command-r-plus");
  assert.equal(body.embeddingModel, "cohere.embed-english-v3.0");
  assert.equal(body.cacheStatus, "miss");
  assert.match(body.summary, /high-risk records/i);
  assert.ok(body.records.length >= 2);
  assert.ok(body.recommendations.length >= 1);
  assert.equal(body.evaluation.framework, "Agent Studio built-in evaluation framework");
  assert.equal(body.evaluation.deploymentGate, "pass");
  assert.match(JSON.stringify(body.trace), /Oracle Database 23ai AI Vector Search/);
});

test("keeps agentic runtime files and starter cleanup aligned", async () => {
  const [page, data, runtime, providers, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/agentic/runtime.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/agentic/providers.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /useState/);
  assert.match(page, /\/api\/agentic-query/);
  assert.match(page, /aria-label="Manager login"/);
  assert.match(data, /queryTemplates/);
  assert.match(data, /learnerRecords/);
  assert.match(data, /CourseRecommendation/);
  assert.match(runtime, /runAgenticComplianceQuery/);
  assert.match(runtime, /Oracle AI Agent Studio/);
  assert.match(providers, /OracleCoherenceCache/);
  assert.match(providers, /OciCohereEmbeddingClient/);
  assert.match(providers, /Oracle23AiVectorSearchClient/);
  assert.match(layout, /Oracle Fusion Learning Compliance Manager/);
  assert.match(packageJson, /oracle-fusion-learning-agentic-ai/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await access(
    new URL(
      "../public/compliance_multiagent_architecture_v6_unified.svg",
      import.meta.url,
    ),
  );
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});
