import type { ReportStatus } from "@/types/report";
import styles from "./StatusBadge.module.scss";

const LABELS: Record<ReportStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  archived: "Archived",
};

interface Props {
  status: ReportStatus;
}

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={`${styles.badge} ${styles[status]}`}
      aria-label={`Status: ${LABELS[status]}`}
    >
      <span className={styles.dot} aria-hidden />
      {LABELS[status]}
    </span>
  );
}
