"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./AppProvider";
import { IconHome, IconMoon, IconSettings, IconSun } from "./icons";

/**
 * One page, so one nav item. Settings sits in the footer — it's the only route
 * to backups, the PIN lock and notification toggles, and doesn't belong in the
 * daily flow.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { counts, theme, setTheme } = useApp();

  const active = pathname === "/";
  const overdue = counts.overdue;
  const due = counts.dueToday;
  const badge = overdue > 0 ? overdue : due;
  const badgeIsOverdue = overdue > 0;
  const badgeText =
    badge > 0 ? (badgeIsOverdue ? `${badge} overdue` : `${badge} due today`) : "";

  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark" aria-hidden="true">
          OD
        </span>
        <span className="sidebar-brand-copy">
          <div className="sidebar-brand-text">Office Dashboard</div>
          <div className="sidebar-brand-sub">Tasks &amp; mistakes</div>
        </span>
      </div>

      <Link
        href="/"
        className={`nav-item${active ? " active" : ""}`}
        aria-current={active ? "page" : undefined}
        // The label is display:none on narrow widths, which strips it from the
        // accessibility tree — so name the link explicitly, always.
        aria-label={badgeText ? `Home — ${badgeText}` : "Home"}
        title="Home"
        style={{ position: "relative" }}
      >
        <span className="nav-icon" aria-hidden="true">
          <IconHome size={17} />
        </span>
        <span className="nav-label">Home</span>
        {badge > 0 && (
          <span
            className={`nav-badge${badgeIsOverdue ? " overdue" : ""}`}
            aria-hidden="true"
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>

      <div className="sidebar-footer">
        <button
          type="button"
          className="nav-item"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span className="nav-icon" aria-hidden="true">
            {theme === "dark" ? <IconSun size={17} /> : <IconMoon size={17} />}
          </span>
          <span className="nav-label">{theme === "dark" ? "Light" : "Dark"} mode</span>
        </button>

        <Link
          href="/settings"
          className={`nav-item${pathname.startsWith("/settings") ? " active" : ""}`}
          aria-label="Settings"
          title="Settings"
        >
          <span className="nav-icon" aria-hidden="true">
            <IconSettings size={17} />
          </span>
          <span className="nav-label">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
