import { NextResponse } from "next/server";
import { getReportById } from "@/lib/reports-repository";
import { jsonError } from "@/lib/http";
import type { Report } from "@/types/report";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export function GET(_request: Request, context: RouteContext) {
  const { id } = context.params;

  if (!id) {
    return jsonError(400, "bad_request", "Report id is required.");
  }

  const report = getReportById(id);
  if (!report) {
    return jsonError(404, "not_found", `No report found for id "${id}".`);
  }

  return NextResponse.json<Report>(report, {
    headers: { "Cache-Control": "no-store" },
  });
}
