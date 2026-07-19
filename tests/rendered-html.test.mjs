import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
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
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Oracle Fusion Learning Compliance Manager<\/title>/i);
  assert.match(html, /Manager compliance command center/);
  assert.match(html, /Manager query/);
  assert.match(html, /Run query/);
  assert.match(html, /Approve staged outreach/);
  assert.match(html, /Maya Chen/);
  assert.match(html, /POL-DP-014/);
  assert.match(html, /Data Privacy Refresher for Finance Teams/);
  assert.match(html, /Unified multi-agent compliance and RAG architecture/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps test data and starter cleanup aligned", async () => {
  const [page, data, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /useState/);
  assert.match(page, /resolveRecords/);
  assert.match(page, /aria-label="Manager login"/);
  assert.match(data, /queryTemplates/);
  assert.match(data, /learnerRecords/);
  assert.match(data, /CourseRecommendation/);
  assert.match(layout, /Oracle Fusion Learning Compliance Manager/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await access(
    new URL(
      "../public/compliance_multiagent_architecture_v6_unified.svg",
      import.meta.url,
    ),
  );
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});
