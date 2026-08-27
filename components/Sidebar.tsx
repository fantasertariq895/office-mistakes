"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFetch } from "@/lib/hooks";
import { formatMonthShort } from "@/lib/traffic-billing/month";
import { formatWeekShort } from "@/lib/trader-media/week";
import { useApp } from "./AppProvider";
import { IconChart, IconHome, IconLayers, IconMoon, IconSettings, IconSun } from "./icons";

type TbSummary = {
  run: { id: number; month: string; status: string } | null;
  total: number;
  settled: number;
  percent: number;
};

type TmSummary = {
  run: { id: number; week: string; status: string } | null;
  total: number;
  settled: number;
  percent: number;
};

/**
 * Three workspaces: Home (tasks + commission checklists), Traffic Billing
 * (the monthly SOP run), and Trader Media (the weekly SOP run). Settings sits
 * in the footer — it's the only route to backups, the PIN lock and
 * notification toggles, and doesn't belong in the daily flow.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { counts, theme, setTheme, version } = useApp();

  // Deliberately its own tiny endpoint rather than the full workspace: the
  // sidebar renders on every page and only needs "Aug 2026 · 62%".
  const tb = useFetch<TbSummary>("/api/traffic-billing/summary", version);
  const tbActive = pathname.startsWith("/traffic-billing");
  const tbBadge = tb.data?.run
    ? `${formatMonthShort(tb.data.run.month)} · ${tb.data.percent}%`
    : null;

  const tm = useFetch<TmSummary>("/api/trader-media/summary", version);
  const tmActive = pathname.startsWith("/trader-media");
  const tmBadge = tm.data?.run
    ? `${formatWeekShort(tm.data.run.week)} · ${tm.data.percent}%`
    : null;

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

      <Link
        href="/traffic-billing"
        className={`nav-item${tbActive ? " active" : ""}`}
        aria-current={tbActive ? "page" : undefined}
        aria-label={
          tbBadge ? `Traffic Billing — ${tbBadge} complete` : "Traffic Billing"
        }
        title="Traffic Billing"
      >
        <span className="nav-icon" aria-hidden="true">
          <IconChart size={17} />
        </span>
        <span className="nav-label">Traffic Billing</span>
        {tbBadge && (
          <span className="nav-sub" aria-hidden="true">
            {tbBadge}
          </span>
        )}
      </Link>

      <Link
        href="/trader-media"
        className={`nav-item${tmActive ? " active" : ""}`}
        aria-current={tmActive ? "page" : undefined}
        aria-label={tmBadge ? `Trader Media — ${tmBadge} complete` : "Trader Media"}
        title="Trader Media"
      >
        <span className="nav-icon" aria-hidden="true">
          <IconLayers size={17} />
        </span>
        <span className="nav-label">Trader Media</span>
        {tmBadge && (
          <span className="nav-sub" aria-hidden="true">
            {tmBadge}
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
