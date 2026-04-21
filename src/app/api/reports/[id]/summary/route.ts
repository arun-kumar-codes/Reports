import { NextResponse } from "next/server";
import { getReportById } from "@/lib/reports-repository";
import { generateSummary } from "@/lib/ai-summary";
import { jsonError } from "@/lib/http";
import type { AiSummaryResponse } from "@/types/report";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = context.params;

  if (!id) {
    return jsonError(400, "bad_request", "Report id is required.");
  }

  const report = getReportById(id);
  if (!report) {
    return jsonError(404, "not_found", `No report found for id "${id}".`);
  }

  try {
    const summary = await generateSummary(report);
    return NextResponse.json<AiSummaryResponse>(summary, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown AI provider error";
    console.error(`AI summary generation failed for ${id}:`, message);
    return jsonError(
      502,
      "ai_provider_error",
      "The AI provider could not generate a summary. Please try again.",
    );
  }
}
