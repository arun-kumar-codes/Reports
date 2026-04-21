import Link from "next/link";
import styles from "./report-detail.module.scss";

export default function NotFound() {
  return (
    <section className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/reports">← All reports</Link>
      </nav>
      <header className={styles.header}>
        <h1 className={styles.title}>Report not found</h1>
        <p className={styles.summary}>
          We couldn't find a report for that id. It may have been archived or the
          link is out of date.
        </p>
      </header>
    </section>
  );
}
