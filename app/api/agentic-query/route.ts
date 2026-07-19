import { NextResponse } from "next/server";
import { runAgenticComplianceQuery } from "../../agentic/runtime";
import type { AgenticQueryRequest } from "../../agentic/types";

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

  const result = await runAgenticComplianceQuery({
    query: body.query,
    templateId: body.templateId,
    managerEmail: body.managerEmail,
  });

  return NextResponse.json(result);
}
