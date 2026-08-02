"use client";

import { useApp } from "./AppProvider";
import { IconAlert, IconBell, IconCheckCircle, IconRotate, IconX } from "./icons";

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const bad = toast.tone === "overdue" || toast.tone === "error";
        const good = toast.tone === "success";
        return (
          <div key={toast.id} className={`toast ${toast.tone ?? "info"}`}>
            <span
              style={{
                color: bad
                  ? "var(--danger)"
                  : good
                    ? "var(--success)"
                    : "var(--accent)",
                marginTop: 1,
              }}
            >
              {bad ? (
                <IconAlert size={15} />
              ) : good ? (
                <IconCheckCircle size={15} />
              ) : (
                <IconBell size={15} />
              )}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="toast-title">{toast.title}</div>
              {toast.body && <div className="toast-body">{toast.body}</div>}
              {toast.undo && (
                <div className="toast-undo">
                  <button
                    className="btn btn-sm"
                    onClick={async () => {
                      dismissToast(toast.id);
                      await toast.undo!.run();
                    }}
                  >
                    <IconRotate size={13} />
                    {toast.undo.label}
                  </button>
                </div>
              )}
            </div>
            <button
              className="btn btn-icon"
              style={{ width: 26, height: 26 }}
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <IconX size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
