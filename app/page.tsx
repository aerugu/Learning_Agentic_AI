"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  guardrails,
  learnerRecords,
  managerProfile,
  queryTemplates,
  recommendations,
  type LearnerRecord,
  type QueryTemplate,
} from "./data";

type QueryResult = {
  query: string;
  template: QueryTemplate;
  generatedAt: string;
  records: LearnerRecord[];
  summary: string;
};

const defaultTemplate = queryTemplates[0];

function getStatusLabel(status: LearnerRecord["status"]) {
  return status
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveRecords(template: QueryTemplate, query: string) {
  const normalized = `${template.intent} ${query}`.toLowerCase();

  if (normalized.includes("complete") && !normalized.includes("not completed")) {
    return learnerRecords;
  }

  if (normalized.includes("risk") || normalized.includes("escalation")) {
    return learnerRecords
      .filter((record) => record.riskScore >= 70)
      .sort((left, right) => right.riskScore - left.riskScore);
  }

  if (normalized.includes("recommend")) {
    return learnerRecords.filter((record) => record.status !== "complete");
  }

  return learnerRecords.filter((record) => record.status !== "complete");
}

function summarize(records: LearnerRecord[], template: QueryTemplate) {
  const overdue = records.filter((record) => record.status === "overdue").length;
  const review = records.filter((record) => record.status === "under-review").length;
  const escalation = records.filter((record) => record.escalation !== "none").length;

  if (template.intent === "communications") {
    return `${records.length} learners need manager-reviewed outreach. ${review} are frozen by dispute or eligibility review; ${escalation} have an escalation rung ready after approval.`;
  }

  if (template.intent === "recommendations") {
    return `${records.length} learners have course gaps. The recommender uses outcome and skill vectors first, then falls back to syllabus similarity when confidence drops.`;
  }

  if (template.intent === "risk") {
    return `${records.length} high-risk records found. ${overdue} are overdue and ${review} require human review before any notification is sent.`;
  }

  return `${records.length} learners require attention. ${overdue} are overdue, ${review} are under review, and every row includes policy citations for audit readiness.`;
}

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [managerEmail, setManagerEmail] = useState("asha.mehta@example.com");
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate);
  const [query, setQuery] = useState(defaultTemplate.query);
  const [result, setResult] = useState<QueryResult>(() => {
    const records = resolveRecords(defaultTemplate, defaultTemplate.query);

    return {
      query: defaultTemplate.query,
      template: defaultTemplate,
      generatedAt: managerProfile.lastSync,
      records,
      summary: summarize(records, defaultTemplate),
    };
  });

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

  function runQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const records = resolveRecords(selectedTemplate, query);

    setResult({
      query,
      template: selectedTemplate,
      generatedAt: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      records,
      summary: summarize(records, selectedTemplate),
    });
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
              <span>RAG substrate: org-scoped ANN, score fusion, 32k context assembly</span>
              <button type="submit">Run query</button>
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
            </div>
            <button type="button">Approve staged outreach</button>
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
              {recommendations.map((course) => (
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
        </div>
      </section>
    </main>
  );
}
