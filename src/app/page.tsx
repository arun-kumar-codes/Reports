import Link from "next/link";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <p className={styles.kicker}>Next.js · App Router · TypeScript</p>
        <h1 className={styles.title}>Reports Dashboard</h1>
        <p className={styles.subtitle}>
          Browse reports, search and sort through them via a real API, and generate
          AI-powered summaries on demand. Role-gated middleware protects the reports
          surface — switch your role in the top bar to see it in action.
        </p>
        <div className={styles.actions}>
          <Link href="/reports" className={styles.primaryCta}>
            Open reports
          </Link>
        </div>

        <ul className={styles.featureGrid}>
          <li>
            <strong>API-driven search & sort</strong>
            <span>Filtering happens on the server route, not in the client.</span>
          </li>
          <li>
            <strong>Role-gated routes</strong>
            <span>Middleware redirects guests away from the reports surface.</span>
          </li>
          <li>
            <strong>AI summaries</strong>
            <span>Real OpenAI when configured, deterministic mock otherwise.</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
