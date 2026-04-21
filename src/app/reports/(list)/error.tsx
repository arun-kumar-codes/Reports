"use client";

import { useEffect } from "react";
import styles from "./reports.module.scss";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ReportsError({ error, reset }: Props) {
  useEffect(() => {
    console.error("Reports segment error:", error);
  }, [error]);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.subtitle}>
          We couldn't load reports. {error.message ? `Details: ${error.message}` : null}
        </p>
      </header>
      <div className={styles.empty}>
        <button
          type="button"
          onClick={reset}
          style={{
            background: "transparent",
            color: "inherit",
            border: "1px solid currentColor",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </section>
  );
}
