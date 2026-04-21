import Link from "next/link";
import styles from "./forbidden.module.scss";

interface Props {
  searchParams: { from?: string; required?: string };
}

export const metadata = { title: "Access denied" };

export default function ForbiddenPage({ searchParams }: Props) {
  const required = searchParams.required ?? "viewer";
  const from = searchParams.from ?? "/";

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <span className={styles.badge}>403 · Forbidden</span>
        <h1 className={styles.title}>You don't have access to that page</h1>
        <p className={styles.body}>
          <code>{from}</code> requires at least the <strong>{required}</strong> role.
          Use the role switcher in the top bar to elevate your permissions — this demo
          accepts any selection — and then try again.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.link}>
            ← Back home
          </Link>
          <Link href={from} className={styles.retry}>
            Retry once elevated
          </Link>
        </div>
      </div>
    </section>
  );
}
