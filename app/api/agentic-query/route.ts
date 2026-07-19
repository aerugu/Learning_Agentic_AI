import { NextResponse } from "next/server";

type AgenticQueryRequest = {
  query: string;
  templateId: string;
  managerEmail: string;
};

const PYTHON_BACKEND_URL =
  process.env.PYTHON_AGENTIC_BACKEND_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AgenticQueryRequest>;

  if (!body.query || !body.templateId || !body.managerEmail) {
    return NextResponse.json(
      {
        error: "query, templateId, and managerEmail are required",
      },
      { status: 400 },
    );
  }

  const response = await fetch(`${PYTHON_BACKEND_URL}/agentic-query`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: body.query,
      templateId: body.templateId,
      managerEmail: body.managerEmail,
    }),
  });

  const result = await response.json();

  return NextResponse.json(result, { status: response.status });
}
