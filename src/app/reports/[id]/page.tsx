import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportById } from "@/lib/reports-repository";
import { StatusBadge } from "@/components/StatusBadge/StatusBadge";
import { AiSummary } from "./_components/AiSummary";
import { formatDateTime, formatNumber, titleCase } from "@/lib/format";
import type { Metadata } from "next";
import styles from "./report-detail.module.scss";

interface PageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PageProps): Metadata {
  const report = getReportById(params.id);
  return { title: report ? report.title : "Report not found" };
}

export default function ReportDetailPage({ params }: PageProps) {
  const report = getReportById(params.id);
  if (!report) notFound();

  return (
    <article className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/reports">← All reports</Link>
      </nav>

      <header className={styles.header}>
        <div className={styles.headerTopRow}>
          <span className={styles.category}>{titleCase(report.category)}</span>
          <StatusBadge status={report.status} />
        </div>
        <h1 className={styles.title}>{report.title}</h1>
        <p className={styles.summary}>{report.summary}</p>

        <dl className={styles.meta}>
          <div>
            <dt>Author</dt>
            <dd>{report.author}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>
              <time dateTime={report.createdAt}>
                {formatDateTime(report.createdAt)}
              </time>
            </dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>
              <time dateTime={report.updatedAt}>
                {formatDateTime(report.updatedAt)}
              </time>
            </dd>
          </div>
          <div>
            <dt>Views</dt>
            <dd>{formatNumber(report.metrics.views)}</dd>
          </div>
        </dl>
      </header>

      <section className={styles.summarySection} aria-labelledby="ai-summary-heading">
        <AiSummary reportId={report.id} />
      </section>

      <section className={styles.bodySection} aria-label="Report contents">
        <h2 className={styles.sectionHeading}>Contents</h2>
        <p className={styles.body}>{report.content}</p>

        <h2 className={styles.sectionHeading}>Tags</h2>
        <ul className={styles.tagList}>
          {report.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              #{tag}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
