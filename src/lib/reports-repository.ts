import reportsData from "@/data/reports.json";
import type {
  Report,
  ReportListQuery,
  ReportListResponse,
  ReportSortKey,
  SortDirection,
} from "@/types/report";

const DEFAULT_SORT: ReportSortKey = "updatedAt";
const DEFAULT_ORDER: SortDirection = "desc";

const SORT_KEYS: readonly ReportSortKey[] = [
  "title",
  "createdAt",
  "updatedAt",
  "author",
  "views",
] as const;

const ORDERS: readonly SortDirection[] = ["asc", "desc"] as const;

const reports: Report[] = reportsData as Report[];

function isSortKey(value: unknown): value is ReportSortKey {
  return typeof value === "string" && (SORT_KEYS as readonly string[]).includes(value);
}

function isOrder(value: unknown): value is SortDirection {
  return typeof value === "string" && (ORDERS as readonly string[]).includes(value);
}

function compareReports(
  a: Report,
  b: Report,
  sort: ReportSortKey,
  order: SortDirection,
): number {
  const direction = order === "asc" ? 1 : -1;

  switch (sort) {
    case "title":
      return a.title.localeCompare(b.title) * direction;
    case "author":
      return a.author.localeCompare(b.author) * direction;
    case "views":
      return (a.metrics.views - b.metrics.views) * direction;
    case "createdAt":
    case "updatedAt": {
      const aTime = new Date(a[sort]).getTime();
      const bTime = new Date(b[sort]).getTime();
      return (aTime - bTime) * direction;
    }
    default: {
      const _exhaustive: never = sort;
      return _exhaustive;
    }
  }
}

function matchesQuery(report: Report, term: string): boolean {
  if (!term) return true;
  const haystack = [
    report.title,
    report.summary,
    report.content,
    report.author,
    report.category,
    ...report.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

export function parseQuery(params: URLSearchParams): ReportListQuery {
  const q = params.get("q")?.trim() ?? undefined;

  const rawSort = params.get("sort");
  const sort = isSortKey(rawSort) ? rawSort : undefined;

  const rawOrder = params.get("order");
  const order = isOrder(rawOrder) ? rawOrder : undefined;

  const category = params.get("category") ?? undefined;
  const status = params.get("status") ?? undefined;

  return {
    q: q || undefined,
    sort,
    order,
    category: category as ReportListQuery["category"],
    status: status as ReportListQuery["status"],
  };
}

export function listReports(query: ReportListQuery = {}): ReportListResponse {
  const sort = query.sort ?? DEFAULT_SORT;
  const order = query.order ?? DEFAULT_ORDER;
  const term = (query.q ?? "").toLowerCase().trim();

  const filtered = reports.filter((report) => {
    if (!matchesQuery(report, term)) return false;
    if (query.category && report.category !== query.category) return false;
    if (query.status && report.status !== query.status) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => compareReports(a, b, sort, order));

  return {
    items: sorted,
    total: sorted.length,
    query: { ...query, sort, order },
  };
}

export function getReportById(id: string): Report | null {
  return reports.find((report) => report.id === id) ?? null;
}

export function getAllReportIds(): string[] {
  return reports.map((report) => report.id);
}
