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

test("keeps agentic runtime files and starter cleanup aligned", async () => {
  const [page, data, route, pythonRuntime, pythonProviders, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/agentic-query/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../backend/agentic/runtime.py", import.meta.url), "utf8"),
    readFile(new URL("../backend/agentic/providers.py", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /useState/);
  assert.match(page, /\/api\/agentic-query/);
  assert.match(page, /aria-label="Manager login"/);
  assert.match(data, /queryTemplates/);
  assert.match(data, /learnerRecords/);
  assert.match(data, /CourseRecommendation/);
  assert.match(route, /PYTHON_AGENTIC_BACKEND_URL/);
  assert.match(route, /agentic-query/);
  assert.match(pythonRuntime, /run_agentic_compliance_query/);
  assert.match(pythonRuntime, /Oracle AI Agent Studio/);
  assert.match(pythonProviders, /OracleCoherenceCache/);
  assert.match(pythonProviders, /OciCohereEmbeddingClient/);
  assert.match(pythonProviders, /Oracle23AiVectorSearchClient/);
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
