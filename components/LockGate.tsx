"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { LOCKED_EVENT, api } from "@/lib/client";
import { IconAlert, IconLock } from "./icons";

type Status = { pinSet: boolean; unlocked: boolean; forcePin: boolean };

/**
 * Sits outside AppProvider so nothing behind the lock screen ever mounts (and
 * therefore nothing fetches) while the dashboard is locked.
 */
export function LockGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status | null>(null);
  // A failed status check (missing DATABASE_URL, misconfigured env vars, the
  // server erroring) must never render identically to a real lock screen —
  // it was doing exactly that before, and looked like a working PIN prompt
  // on a deployment that had never actually started.
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const next = await api.get<Status>("/api/auth/status");
      setStatus(next);
      setConnectionError(null);
    } catch (err) {
      setStatus(null);
      setConnectionError(
        err instanceof Error ? err.message : "Could not reach the server"
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onLocked = () =>
      setStatus((s) => (s ? { ...s, unlocked: false } : s));
    window.addEventListener(LOCKED_EVENT, onLocked);
    return () => window.removeEventListener(LOCKED_EVENT, onLocked);
  }, [refresh]);

  const unlock = async (e: FormEvent) => {
    e.preventDefault();
    if (!pin || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/auth/unlock", { pin });
      setPin("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock");
    } finally {
      setBusy(false);
    }
  };

  if (connectionError) {
    return (
      <div className="lock-screen">
        <div className="lock-card">
          <div className="lock-mark" style={{ background: "var(--danger)" }}>
            <IconAlert size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 16 }}>Can&apos;t reach the dashboard</h1>
            <p className="small muted" style={{ marginTop: 4 }}>
              {connectionError}
            </p>
          </div>
          <p className="small subtle">
            This isn&apos;t a lock screen — the app couldn&apos;t load your
            data at all. On a fresh deployment this almost always means an
            environment variable is missing or the database schema hasn&apos;t
            been pushed yet.
          </p>
          <button className="btn btn-block" type="button" onClick={() => void refresh()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="lock-screen" aria-live="polite" aria-busy="true">
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 13 }} />
      </div>
    );
  }

  if (status.pinSet && !status.unlocked) {
    return (
      <div className="lock-screen">
        <form className="lock-card" onSubmit={unlock}>
          <div className="lock-mark">
            <IconLock size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 16 }}>Office Dashboard</h1>
            <p className="small muted" style={{ marginTop: 4 }}>
              Enter your PIN to unlock
            </p>
          </div>
          <input
            className="input pin-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            aria-label="PIN"
          />
          {error && <div className="error-text">{error}</div>}
          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={busy || pin.length < 4}
          >
            Unlock
          </button>
          <p className="small subtle">
            {status.forcePin
              ? "This deployment always requires a PIN."
              : "Sessions last 30 days, or until the PIN changes."}
          </p>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
