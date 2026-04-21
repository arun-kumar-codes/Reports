import styles from "./reports.module.scss";
import loading from "./loading.module.scss";

export default function ReportsLoading() {
  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Reports</h1>
        <p className={styles.subtitle}>Loading the latest reports…</p>
      </header>

      <ul className={styles.grid} aria-hidden>
        {Array.from({ length: 6 }).map((_, index) => (
          <li key={index} className={loading.cardSkeleton}>
            <span className={loading.line} style={{ width: "40%" }} />
            <span className={loading.line} style={{ width: "85%" }} />
            <span className={loading.line} style={{ width: "95%" }} />
            <span className={loading.line} style={{ width: "70%" }} />
            <span className={loading.line} style={{ width: "55%" }} />
          </li>
        ))}
      </ul>
    </section>
  );
}
