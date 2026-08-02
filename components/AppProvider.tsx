"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/client";
import { toDateInputValue } from "@/lib/date";
import type { AppSettings, Commission, NotificationPoll } from "@/lib/types";

export type CommissionSummary = Commission & {
  openTaskCount: number;
  _count: {
    checklistItems: number;
    mistakes: number;
    contacts: number;
    approvalRequirements: number;
  };
};

export type Toast = {
  id: number;
  title: string;
  body?: string;
  tone?: "info" | "overdue" | "error" | "success";
  /** Reversible deletes surface Undo here instead of a confirm dialog. */
  undo?: { label: string; run: () => Promise<void> | void };
  durationMs?: number;
};

type DesktopPermission = NotificationPermission | "unsupported";

type AppContextValue = {
  commissions: CommissionSummary[];
  commissionById: (id: number | null | undefined) => CommissionSummary | null;
  commissionsLoading: boolean;
  reloadCommissions: () => Promise<void>;

  currentCommissionId: number | null;
  setCurrentCommissionId: (id: number | null) => void;
  currentCommission: CommissionSummary | null;

  settings: AppSettings | null;
  reloadSettings: () => Promise<void>;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;

  counts: { dueToday: number; overdue: number; badge: number };
  desktopPermission: DesktopPermission;
  requestDesktopPermission: () => Promise<void>;

  toasts: Toast[];
  pushToast: (toast: Omit<Toast, "id">) => number;
  dismissToast: (id: number) => void;

  /** Bump after any mutation so other mounted screens refetch. */
  version: number;
  bump: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const CURRENT_COMMISSION_KEY = "ops.currentCommissionId";
const THEME_KEY = "ops.theme";
const NOTIFIED_KEY = "ops.notifiedAlerts";
const POLL_MS = 30_000;

/**
 * The server no longer tracks which alerts a browser has already seen (see
 * lib/notifications.ts) — that dedupe now lives here, in localStorage, keyed
 * by day so it can't grow forever and naturally resets tomorrow.
 */
function loadNotifiedToday(): Set<string> {
  try {
    const raw = window.localStorage.getItem(NOTIFIED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { day: string; ids: string[] };
    if (parsed.day !== toDateInputValue(new Date())) return new Set();
    return new Set(parsed.ids);
  } catch {
    return new Set();
  }
}

function saveNotifiedToday(ids: Set<string>) {
  try {
    window.localStorage.setItem(
      NOTIFIED_KEY,
      JSON.stringify({ day: toDateInputValue(new Date()), ids: [...ids] })
    );
  } catch {
    /* storage may be unavailable */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [commissions, setCommissions] = useState<CommissionSummary[]>([]);
  const [commissionsLoading, setCommissionsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentCommissionId, setCurrentId] = useState<number | null>(null);
  const [counts, setCounts] = useState({ dueToday: 0, overdue: 0, badge: 0 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [version, setVersion] = useState(0);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [desktopPermission, setDesktopPermission] =
    useState<DesktopPermission>("unsupported");
  const toastId = useRef(0);

  /* ------------------------------------------------------------- toasts -- */

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev, { ...toast, id }].slice(-4));
      // Undo needs a longer window than a plain acknowledgement.
      setTimeout(() => dismissToast(id), toast.durationMs ?? (toast.undo ? 10_000 : 7000));
      return id;
    },
    [dismissToast]
  );

  /* --------------------------------------------------------------- data -- */

  const reloadCommissions = useCallback(async () => {
    try {
      setCommissions(await api.get<CommissionSummary[]>("/api/commissions"));
    } catch {
      /* lock screen / offline — leave the last known list in place */
    } finally {
      setCommissionsLoading(false);
    }
  }, []);

  const reloadSettings = useCallback(async () => {
    try {
      const next = await api.get<AppSettings>("/api/settings");
      setSettings(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  /* -------------------------------------------------------------- theme -- */

  const applyTheme = useCallback((next: "light" | "dark") => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback(
    (next: "light" | "dark") => {
      applyTheme(next);
      void api.patch("/api/settings", { theme: next }).then(
        () => setSettings((s) => (s ? { ...s, theme: next } : s)),
        () => undefined
      );
    },
    [applyTheme]
  );

  /* --------------------------------------------------------- first load -- */

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CURRENT_COMMISSION_KEY);
      if (stored) {
        const parsed = Number(JSON.parse(stored));
        if (Number.isInteger(parsed)) setCurrentId(parsed);
      }
      const storedTheme = window.localStorage.getItem(THEME_KEY);
      if (storedTheme === "dark" || storedTheme === "light") {
        setThemeState(storedTheme);
      }
    } catch {
      /* ignore */
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      setDesktopPermission(Notification.permission);
    }

    void reloadCommissions();
    void reloadSettings().then((s) => {
      if (s?.theme === "light" || s?.theme === "dark") applyTheme(s.theme);
    });
  }, [applyTheme, reloadCommissions, reloadSettings]);

  const setCurrentCommissionId = useCallback((id: number | null) => {
    setCurrentId(id);
    try {
      window.localStorage.setItem(CURRENT_COMMISSION_KEY, JSON.stringify(id));
    } catch {
      /* ignore */
    }
  }, []);

  /* ------------------------------------------------------ notifications -- */

  const requestDesktopPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setDesktopPermission(result);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const notified = loadNotifiedToday();

    const poll = async () => {
      try {
        const data = await api.get<NotificationPoll>("/api/notifications");
        if (cancelled) return;
        setCounts({
          dueToday: data.dueToday,
          overdue: data.overdue,
          badge: data.badge,
        });

        // The server returns the full current picture every time; this
        // browser decides which of those it hasn't already surfaced today.
        const fresh = data.alerts.filter(
          (a) => !notified.has(`${a.kind}:${a.taskId}`)
        );
        if (fresh.length === 0) return;

        for (const alert of fresh) {
          notified.add(`${alert.kind}:${alert.taskId}`);
          pushToast({
            title: alert.title,
            body: alert.body,
            tone: alert.kind === "task_overdue" ? "overdue" : "info",
          });
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(`${alert.title} — Office Dashboard`, {
                body: alert.body,
                tag: `ops-${alert.kind}-${alert.taskId}`,
              });
            } catch {
              /* some browsers block constructor notifications */
            }
          }
        }
        saveNotifiedToday(notified);
      } catch {
        /* locked or offline — try again next tick */
      }
    };

    void poll();
    const timer = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pushToast]);

  /* -------------------------------------------------------------- value -- */

  const commissionById = useCallback(
    (id: number | null | undefined) =>
      id == null ? null : (commissions.find((c) => c.id === id) ?? null),
    [commissions]
  );

  const currentCommission = useMemo(
    () => commissionById(currentCommissionId),
    [commissionById, currentCommissionId]
  );

  // A commission deleted elsewhere shouldn't leave a dangling selection.
  useEffect(() => {
    if (
      currentCommissionId !== null &&
      !commissionsLoading &&
      commissions.length > 0 &&
      !commissions.some((c) => c.id === currentCommissionId)
    ) {
      setCurrentCommissionId(null);
    }
  }, [commissions, commissionsLoading, currentCommissionId, setCurrentCommissionId]);

  const value: AppContextValue = {
    commissions,
    commissionById,
    commissionsLoading,
    reloadCommissions,
    currentCommissionId,
    setCurrentCommissionId,
    currentCommission,
    settings,
    reloadSettings: async () => {
      await reloadSettings();
    },
    theme,
    setTheme,
    counts,
    desktopPermission,
    requestDesktopPermission,
    toasts,
    pushToast,
    dismissToast,
    version,
    bump,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
