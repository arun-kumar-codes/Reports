"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent } from "react";
import { ROLES, type Role } from "@/lib/auth";
import styles from "./SiteHeader.module.scss";

interface Props {
  initialRole: Role;
}

export function RoleSwitcher({ initialRole }: Props) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as Role;
    const previous = role;
    setRole(next);
    setError(null);

    try {
      const response = await fetch("/api/auth/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (!response.ok) throw new Error(`Failed with status ${response.status}`);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setRole(previous);
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  return (
    <div className={styles.roleControl}>
      <label className={styles.roleLabel} htmlFor="role-select">
        Role
      </label>
      <select
        id="role-select"
        className={styles.roleSelect}
        value={role}
        onChange={handleChange}
        disabled={isPending}
      >
        {ROLES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? (
        <span role="alert" className={styles.roleError}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
