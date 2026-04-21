import { fetchReports } from "@/lib/api-client";
import { ReportCard } from "@/components/ReportCard/ReportCard";
import { ReportFilters } from "../_components/ReportFilters";
import type { ReportListQuery, ReportSortKey, SortDirection } from "@/types/report";
import styles from "./reports.module.scss";

export const metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

const SORT_KEYS: readonly ReportSortKey[] = [
  "title",
  "createdAt",
  "updatedAt",
  "author",
  "views",
];
const ORDERS: readonly SortDirection[] = ["asc", "desc"];

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function paramsToQuery(
  searchParams: PageProps["searchParams"],
): ReportListQuery {
  const rawSort = firstValue(searchParams.sort);
  const rawOrder = firstValue(searchParams.order);

  return {
    q: firstValue(searchParams.q)?.trim() || undefined,
    sort: (SORT_KEYS as readonly string[]).includes(rawSort ?? "")
      ? (rawSort as ReportSortKey)
      : undefined,
    order: (ORDERS as readonly string[]).includes(rawOrder ?? "")
      ? (rawOrder as SortDirection)
      : undefined,
    category: firstValue(searchParams.category) as ReportListQuery["category"],
    status: firstValue(searchParams.status) as ReportListQuery["status"],
  };
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const query = paramsToQuery(searchParams);
  const { items, total, query: resolvedQuery } = await fetchReports(query);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Reports</h1>
          <p className={styles.subtitle}>
            {total} {total === 1 ? "report" : "reports"}
            {query.q ? (
              <>
                {" "}
                matching <strong>{query.q}</strong>
              </>
            ) : null}
            . Sorted by {resolvedQuery.sort} ({resolvedQuery.order}).
          </p>
        </div>
      </header>

      <ReportFilters
        initial={{
          q: query.q ?? "",
          sort: resolvedQuery.sort,
          order: resolvedQuery.order,
          category: query.category ?? "",
          status: query.status ?? "",
        }}
      />

      {items.length === 0 ? (
        <div className={styles.empty} role="status">
          <h2>No reports match your filters</h2>
          <p>Try broadening your search or clearing a filter.</p>
        </div>
      ) : (
        <ul className={styles.grid}>
          {items.map((report) => (
            <li key={report.id}>
              <ReportCard report={report} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
