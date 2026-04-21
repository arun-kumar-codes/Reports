import { NextRequest, NextResponse } from "next/server";
import { listReports, parseQuery } from "@/lib/reports-repository";
import { jsonError } from "@/lib/http";
import type { ReportListResponse } from "@/types/report";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  try {
    const query = parseQuery(request.nextUrl.searchParams);
    const result = listReports(query);
    return NextResponse.json<ReportListResponse>(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET /api/reports failed", error);
    return jsonError(500, "internal_error", "Failed to list reports.");
  }
}
