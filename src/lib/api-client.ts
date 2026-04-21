import "server-only";
import { headers } from "next/headers";
import type { ReportListQuery, ReportListResponse } from "@/types/report";

/**
 * Server-side API client. Builds absolute URLs so `fetch` works inside
 * server components regardless of environment. Do NOT import this file
 * from client components — use src/lib/api-browser.ts instead.
 */

function resolveBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) throw new Error("Unable to determine request host.");
  return `${proto}://${host}`;
}

function buildQuery(query: ReportListQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  if (query.category) params.set("category", query.category);
  if (query.status) params.set("status", query.status);
  const str = params.toString();
  return str ? `?${str}` : "";
}

export async function fetchReports(
  query: ReportListQuery = {},
): Promise<ReportListResponse> {
  const url = `${resolveBaseUrl()}/api/reports${buildQuery(query)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load reports (${response.status})`);
  }
  return (await response.json()) as ReportListResponse;
}

