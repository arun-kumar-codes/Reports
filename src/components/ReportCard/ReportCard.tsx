import Link from "next/link";
import type { Report } from "@/types/report";
import { StatusBadge } from "@/components/StatusBadge/StatusBadge";
import { formatDate, formatNumber, titleCase } from "@/lib/format";
import styles from "./ReportCard.module.scss";

interface Props {
  report: Report;
}

export function ReportCard({ report }: Props) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <span className={styles.category}>{titleCase(report.category)}</span>
        <StatusBadge status={report.status} />
      </header>

      <h3 className={styles.title}>
        <Link href={`/reports/${report.id}`} className={styles.titleLink}>
          {report.title}
        </Link>
      </h3>

      <p className={styles.summary}>{report.summary}</p>

      <ul className={styles.tags} aria-label="Tags">
        {report.tags.slice(0, 4).map((tag) => (
          <li key={tag} className={styles.tag}>
            #{tag}
          </li>
        ))}
      </ul>

      <footer className={styles.footer}>
        <div className={styles.meta}>
          <span className={styles.author}>{report.author}</span>
          <span className={styles.dot} aria-hidden />
          <time dateTime={report.updatedAt}>{formatDate(report.updatedAt)}</time>
        </div>
        <div className={styles.metrics} aria-label="Engagement metrics">
          <span>{formatNumber(report.metrics.views)} views</span>
          <span>{report.metrics.readTimeMinutes} min read</span>
        </div>
      </footer>
    </article>
  );
}
