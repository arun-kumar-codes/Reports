import type { AiSummaryResponse } from "@/types/report";

/**
 * Client-side API helpers. Use relative URLs so they work in the browser
 * without host resolution.
 */

export async function fetchSummary(id: string): Promise<AiSummaryResponse> {
  const response = await fetch(
    `/api/reports/${encodeURIComponent(id)}/summary`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as {
        error?: { message?: string };
      };
      detail = body.error?.message ?? "";
    } catch {
      /* response wasn't JSON — ignore */
    }
    throw new Error(
      detail || `Summary request failed with status ${response.status}`,
    );
  }

  return (await response.json()) as AiSummaryResponse;
}
