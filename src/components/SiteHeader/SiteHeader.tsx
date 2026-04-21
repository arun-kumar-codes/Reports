import Link from "next/link";
import { cookies } from "next/headers";
import { parseRole, ROLE_COOKIE } from "@/lib/auth";
import { RoleSwitcher } from "./RoleSwitcher";
import styles from "./SiteHeader.module.scss";

export function SiteHeader() {
  const role = parseRole(cookies().get(ROLE_COOKIE)?.value);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logoDot} aria-hidden />
          <span>Reports</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/reports" className={styles.navLink}>
            Reports
          </Link>
        </nav>

        <RoleSwitcher initialRole={role} />
      </div>
    </header>
  );
}
