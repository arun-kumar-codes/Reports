"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSummary } from "@/lib/api-browser";
import { formatDateTime } from "@/lib/format";
import type { AiSummaryResponse } from "@/types/report";
import styles from "./AiSummary.module.scss";

interface Props {
  reportId: string;
  autoLoad?: boolean;
}

type Status = "idle" | "loading" | "success" | "error";

export function AiSummary({ reportId, autoLoad = true }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<AiSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Guards against setting state on an unmounted component when a slow
  // request resolves after the user navigates away.
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetchSummary(reportId);
      if (!isMounted.current) return;
      setData(response);
      setStatus("success");
    } catch (err) {
      if (!isMounted.current) return;
      setError(err instanceof Error ? err.message : "Failed to generate summary");
      setStatus("error");
    }
  }, [reportId]);

  useEffect(() => {
    if (autoLoad) void load();
  }, [autoLoad, load]);

  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.titleBlock}>
          <h2 id="ai-summary-heading" className={styles.title}>
            <span className={styles.sparkle} aria-hidden>
              ✦
            </span>
            AI summary
          </h2>
          <p className={styles.subtitle}>
            Generated from the report contents. Always review before sharing.
          </p>
        </div>

        <button
          type="button"
          className={styles.regenerate}
          onClick={load}
          disabled={status === "loading"}
        >
          {status === "loading"
            ? "Generating…"
            : status === "success"
              ? "Regenerate"
              : "Generate"}
        </button>
      </div>

      <div className={styles.body} aria-live="polite" aria-busy={status === "loading"}>
        {status === "idle" ? (
          <p className={styles.muted}>
            Click <em>Generate</em> to produce an AI summary of this report.
          </p>
        ) : null}

        {status === "loading" ? <SummarySkeleton /> : null}

        {status === "error" && error ? (
          <div role="alert" className={styles.error}>
            <strong>Couldn't generate the summary.</strong>
            <span>{error}</span>
            <button
              type="button"
              onClick={load}
              className={styles.retry}
            >
              Try again
            </button>
          </div>
        ) : null}

        {status === "success" && data ? (
          <>
            <p className={styles.summaryText}>{data.summary}</p>
            <div className={styles.footer}>
              <span
                className={`${styles.sourceTag} ${
                  data.source === "openai" ? styles.sourceLive : styles.sourceMock
                }`}
              >
                {data.source === "openai" ? "OpenAI" : "Mock generator"}
              </span>
              <span className={styles.model}>model: {data.model}</span>
              <span className={styles.timestamp}>
                generated {formatDateTime(data.generatedAt)}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden>
      <span className={styles.skeletonLine} style={{ width: "94%" }} />
      <span className={styles.skeletonLine} style={{ width: "86%" }} />
      <span className={styles.skeletonLine} style={{ width: "72%" }} />
    </div>
  );
}
