"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type {
  ReportCategory,
  ReportSortKey,
  ReportStatus,
  SortDirection,
} from "@/types/report";
import styles from "./ReportFilters.module.scss";

interface InitialState {
  q: string;
  sort: ReportSortKey;
  order: SortDirection;
  category: ReportCategory | "";
  status: ReportStatus | "";
}

interface Props {
  initial: InitialState;
}

const CATEGORY_OPTIONS: Array<{ value: ReportCategory | ""; label: string }> = [
  { value: "", label: "All categories" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "engineering", label: "Engineering" },
  { value: "sales", label: "Sales" },
  { value: "operations", label: "Operations" },
  { value: "product", label: "Product" },
];

const STATUS_OPTIONS: Array<{ value: ReportStatus | ""; label: string }> = [
  { value: "", label: "Any status" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const SORT_OPTIONS: Array<{ value: ReportSortKey; label: string }> = [
  { value: "updatedAt", label: "Last updated" },
  { value: "createdAt", label: "Date created" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "views", label: "Views" },
];

const DEBOUNCE_MS = 250;

export function ReportFilters({ initial }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initial.q);
  const [sort, setSort] = useState<ReportSortKey>(initial.sort);
  const [order, setOrder] = useState<SortDirection>(initial.order);
  const [category, setCategory] = useState<ReportCategory | "">(initial.category);
  const [status, setStatus] = useState<ReportStatus | "">(initial.status);

  // Skip the push that would otherwise fire on mount from the debounced q effect.
  const isFirstRender = useRef(true);

  function pushParams(next: {
    q?: string;
    sort?: ReportSortKey;
    order?: SortDirection;
    category?: ReportCategory | "";
    status?: ReportStatus | "";
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string | undefined) => {
      if (value && value.length > 0) params.set(key, value);
      else params.delete(key);
    };

    if ("q" in next) setOrDelete("q", next.q?.trim());
    if ("sort" in next) setOrDelete("sort", next.sort);
    if ("order" in next) setOrDelete("order", next.order);
    if ("category" in next) setOrDelete("category", next.category || undefined);
    if ("status" in next) setOrDelete("status", next.status || undefined);

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/reports?${qs}` : "/reports", { scroll: false });
    });
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handle = setTimeout(() => {
      pushParams({ q });
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as ReportSortKey;
    setSort(next);
    pushParams({ sort: next });
  }

  function handleOrderToggle() {
    const next: SortDirection = order === "asc" ? "desc" : "asc";
    setOrder(next);
    pushParams({ order: next });
  }

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as ReportCategory | "";
    setCategory(next);
    pushParams({ category: next });
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as ReportStatus | "";
    setStatus(next);
    pushParams({ status: next });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    pushParams({ q });
  }

  function handleReset() {
    setQ("");
    setSort("updatedAt");
    setOrder("desc");
    setCategory("");
    setStatus("");
    startTransition(() => {
      router.replace("/reports", { scroll: false });
    });
  }

  return (
    <form className={styles.bar} onSubmit={handleSubmit} role="search">
      <div className={styles.searchWrap}>
        <label htmlFor="report-search" className={styles.srOnly}>
          Search reports
        </label>
        <input
          id="report-search"
          type="search"
          className={styles.search}
          placeholder="Search title, summary, tags, author…"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          autoComplete="off"
        />
        {isPending ? (
          <span className={styles.pending} aria-live="polite">
            Updating…
          </span>
        ) : null}
      </div>

      <div className={styles.selects}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Category</span>
          <select value={category} onChange={handleCategoryChange}>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Status</span>
          <select value={status} onChange={handleStatusChange}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "any"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Sort by</span>
          <select value={sort} onChange={handleSortChange}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={styles.orderButton}
          aria-label={`Toggle sort order, currently ${order === "asc" ? "ascending" : "descending"}`}
          onClick={handleOrderToggle}
          title="Toggle sort order"
        >
          <span aria-hidden>{order === "asc" ? "↑" : "↓"}</span>
          <span>{order === "asc" ? "Asc" : "Desc"}</span>
        </button>

        <button
          type="button"
          className={styles.resetButton}
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </form>
  );
}
