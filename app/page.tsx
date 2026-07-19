"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  guardrails,
  learnerRecords,
  managerProfile,
  queryTemplates,
  type LearnerRecord,
} from "./data";
import type { AgenticQueryResult } from "./agentic-types";

const defaultTemplate = queryTemplates[0];

function getStatusLabel(status: LearnerRecord["status"]) {
  return status
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function summarize(records: LearnerRecord[]) {
  const overdue = records.filter((record) => record.status === "overdue").length;
  const review = records.filter((record) => record.status === "under-review").length;

  return `${records.length} learners require attention. ${overdue} are overdue, ${review} are under review, and every row includes policy citations for audit readiness.`;
}

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [managerEmail, setManagerEmail] = useState("asha.mehta@example.com");
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate);
  const [query, setQuery] = useState(defaultTemplate.query);
  const [isRunning, setIsRunning] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [result, setResult] = useState<AgenticQueryResult>(() => ({
    query: defaultTemplate.query,
    template: defaultTemplate,
    generatedAt: managerProfile.lastSync,
    runtimeMode: "mock",
    supervisorModel: "cohere.command-r-plus",
    embeddingModel: "cohere.embed-english-v3.0",
    cacheStatus: "bypass",
    records: learnerRecords.filter((record) => record.status !== "complete"),
    recommendations: [],
    summary: summarize(learnerRecords.filter((record) => record.status !== "complete")),
    trace: [],
    evaluation: {
      framework: "Agent Studio built-in evaluation framework",
      dataset: "50-case compliance golden set",
      faithfulness: 0.96,
      answerRelevance: 0.93,
      citationCoverage: 1,
      deploymentGate: "pass",
    },
  }));

  const metrics = useMemo(() => {
    const active = learnerRecords.filter((record) => record.status !== "complete");
    const overdue = learnerRecords.filter((record) => record.status === "overdue");
    const review = learnerRecords.filter((record) => record.status === "under-review");
    const averageRisk = Math.round(
      active.reduce((total, record) => total + record.riskScore, 0) / active.length,
    );

    return [
      { label: "Open learners", value: active.length.toString(), note: "after eligibility filter" },
      { label: "Overdue", value: overdue.length.toString(), note: "needs approval before send" },
      { label: "Under review", value: review.length.toString(), note: "escalation frozen" },
      { label: "Avg risk", value: `${averageRisk}`, note: "agent confidence weighted" },
    ];
  }, []);

  async function runQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsRunning(true);
    setQueryError(null);

    try {
      const response = await fetch("/api/agentic-query", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query,
          templateId: selectedTemplate.id,
          managerEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Agentic query failed");
      }

      setResult((await response.json()) as AgenticQueryResult);
    } catch (error) {
      setQueryError(error instanceof Error ? error.message : "Agentic query failed");
    } finally {
      setIsRunning(false);
    }
  }

  function applyTemplate(template: QueryTemplate) {
    setSelectedTemplate(template);
    setQuery(template.query);
  }

  return (
    <main className="app-shell">
      <section className="login-panel" aria-label="Manager login">
        <div>
          <p className="eyebrow">Oracle Fusion Learning Compliance</p>
          <h1>Manager compliance command center</h1>
          <p className="intro">
            Ask policy-aware questions, review agent findings, approve outreach, and trace each
            result back to a learning record or policy citation.
          </p>
        </div>

        <form
          className="login-card"
          onSubmit={(event) => {
            event.preventDefault();
            setIsSignedIn(true);
          }}
        >
          <label htmlFor="manager-email">Manager email</label>
          <input
            id="manager-email"
            type="email"
            value={managerEmail}
            onChange={(event) => setManagerEmail(event.target.value)}
            autoComplete="email"
          />
          <label htmlFor="manager-password">Password</label>
          <input
            id="manager-password"
            type="password"
            defaultValue="ComplianceDemo2026"
            autoComplete="current-password"
          />
          <button type="submit">{isSignedIn ? "Signed in" : "Sign in as manager"}</button>
          <span className="demo-note">Demo auth uses local state for testing.</span>
        </form>
      </section>

      <section className="workspace" aria-label="Manager query workspace">
        <aside className="side-rail">
          <div>
            <span className="avatar" aria-hidden="true">
              AM
            </span>
            <h2>{managerProfile.name}</h2>
            <p>{managerProfile.role}</p>
          </div>

          <nav aria-label="Query templates">
            {queryTemplates.map((template) => (
              <button
                className={template.id === selectedTemplate.id ? "active" : ""}
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template)}
              >
                {template.label}
              </button>
            ))}
          </nav>

          <div className="architecture-link">
            <Image
              src="/compliance_multiagent_architecture_v6_unified.svg"
              alt="Unified multi-agent compliance and RAG architecture"
              width={1100}
              height={1480}
            />
          </div>
        </aside>

        <div className="manager-desk">
          <div className="top-bar">
            <div>
              <p className="eyebrow">Signed in as {managerEmail}</p>
              <h2>{managerProfile.org}</h2>
            </div>
            <div className={isSignedIn ? "session ready" : "session"}>
              {isSignedIn ? "Session ready" : "Awaiting sign-in"}
            </div>
          </div>

          <div className="metric-grid">
            {metrics.map((metric) => (
              <article key={metric.label} className="metric-card">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.note}</small>
              </article>
            ))}
          </div>

          <form className="query-composer" onSubmit={runQuery}>
            <label htmlFor="manager-query">Manager query</label>
            <textarea
              id="manager-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              rows={4}
            />
            <div className="query-actions">
              <span>
                Oracle stack: Agent Studio, Cohere Command R+, Cohere Embed v3, Coherence,
                Oracle 23ai Vector Search
              </span>
              <button type="submit">{isRunning ? "Running agents" : "Run agent team"}</button>
            </div>
          </form>

          <section className="result-summary" aria-live="polite">
            <div>
              <p className="eyebrow">Agent result</p>
              <h3>{result.summary}</h3>
              <p>
                Query: &quot;{result.query}&quot; generated {result.generatedAt}. Human approval is required
                before reminders leave the system.
              </p>
              {queryError ? <p className="error-text">{queryError}</p> : null}
            </div>
            <button type="button">Approve staged outreach</button>
          </section>

          <section className="agent-stack" aria-label="Agentic AI runtime stack">
            <article>
              <span>Supervisor LLM</span>
              <strong>Cohere Command R+</strong>
              <small>{result.supervisorModel}</small>
            </article>
            <article>
              <span>Embeddings</span>
              <strong>Cohere Embed v3</strong>
              <small>{result.embeddingModel} via OCI Generative AI</small>
            </article>
            <article>
              <span>Semantic Cache</span>
              <strong>Oracle Coherence</strong>
              <small>cache {result.cacheStatus}</small>
            </article>
            <article>
              <span>Vector Retrieval</span>
              <strong>Oracle Database 23ai</strong>
              <small>AI Vector Search</small>
            </article>
            <article>
              <span>Evaluation</span>
              <strong>{result.evaluation.deploymentGate.toUpperCase()}</strong>
              <small>
                faithfulness {Math.round(result.evaluation.faithfulness * 100)}% · citations{" "}
                {Math.round(result.evaluation.citationCoverage * 100)}%
              </small>
            </article>
          </section>

          <section className="results-table" aria-label="Compliance query results">
            <div className="table-header">
              <span>Learner</span>
              <span>Requirement</span>
              <span>Status</span>
              <span>Risk</span>
            </div>
            {result.records.map((record) => (
              <article className="result-row" key={record.id}>
                <div>
                  <strong>{record.name}</strong>
                  <small>
                    {record.id} · {record.department} · {record.location}
                  </small>
                </div>
                <div>
                  <strong>{record.requiredCourse}</strong>
                  <small>{record.reason}</small>
                  <small className="citations">{record.citations.join(" / ")}</small>
                </div>
                <div>
                  <span className={`status ${record.status}`}>{getStatusLabel(record.status)}</span>
                  <small>Due {record.dueDate}</small>
                </div>
                <div>
                  <strong>{record.riskScore}</strong>
                  <small>Escalation: {record.escalation}</small>
                </div>
              </article>
            ))}
          </section>

          <section className="lower-grid">
            <div>
              <p className="eyebrow">Recommended learning</p>
              {result.recommendations.map((course) => (
                <article className="course-card" key={course.courseId}>
                  <div>
                    <strong>{course.title}</strong>
                    <small>
                      {course.courseId} · {course.audience} · {course.duration}
                    </small>
                  </div>
                  <p>{course.matchReason}</p>
                  <span>{course.confidence}% match</span>
                </article>
              ))}
            </div>

            <div>
              <p className="eyebrow">Guardrails active</p>
              <ul className="guardrail-list">
                {guardrails.map((guardrail) => (
                  <li key={guardrail}>{guardrail}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="trace-panel" aria-label="Agent Studio execution trace">
            <p className="eyebrow">Oracle AI Agent Studio trace</p>
            {result.trace.length === 0 ? (
              <p className="trace-empty">Run the agent team to generate a supervisor trace.</p>
            ) : (
              result.trace.map((step) => (
                <article key={step.id}>
                  <div>
                    <strong>{step.agent}</strong>
                    <small>
                      {step.platform} · {step.modelOrService}
                    </small>
                  </div>
                  <span className={`trace-status ${step.status}`}>{step.status}</span>
                  <p>{step.details}</p>
                </article>
              ))
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
