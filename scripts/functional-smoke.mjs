import assert from "node:assert/strict";

const queryPayload = {
  query: "Show overdue learners with escalation risk and policy citations.",
  templateId: "high-risk",
  managerEmail: "asha.mehta@example.com",
};

async function assertOk(url, init) {
  const response = await fetch(url, init);
  assert.equal(response.ok, true, `${url} returned ${response.status}`);
  return response;
}

const uiResponse = await assertOk("http://localhost:3000/");
const uiHtml = await uiResponse.text();
assert.match(uiHtml, /Manager compliance command center/);
assert.match(uiHtml, /Cohere Command R\+/);

const healthResponse = await assertOk("http://localhost:8000/health");
const health = await healthResponse.json();
assert.equal(health.status, "ok");
assert.equal(health.service, "python-agentic-backend");

const agenticResponse = await assertOk("http://localhost:3000/api/agentic-query", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(queryPayload),
});
const agentic = await agenticResponse.json();
assert.equal(agentic.supervisorModel, "cohere.command-r-plus");
assert.equal(agentic.embeddingModel, "cohere.embed-english-v3.0");
assert.equal(agentic.evaluation.deploymentGate, "pass");
assert.match(JSON.stringify(agentic.trace), /Oracle Database 23ai AI Vector Search/);

console.log("Functional smoke tests passed.");
