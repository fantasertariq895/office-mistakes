"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { IconAlert, IconPlus, IconX } from "./icons";

/* ------------------------------------------------------------------ card -- */

export function Card({
  title,
  subtitle,
  count,
  countTone,
  actions,
  children,
  bodyClass,
  headerless,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  count?: number;
  countTone?: "default" | "danger";
  actions?: ReactNode;
  children: ReactNode;
  bodyClass?: string;
  headerless?: boolean;
}) {
  return (
    <section className="card">
      {!headerless && (
        <header className="card-header">
          <h2 className="card-title">
            {title}
            {typeof count === "number" && (
              <span
                className={`count-pill${countTone === "danger" && count > 0 ? " danger" : ""}`}
              >
                {count}
              </span>
            )}
          </h2>
          {subtitle && <span className="card-subtitle">{subtitle}</span>}
          {actions && (
            <>
              <span className="spacer" />
              <span className="row">{actions}</span>
            </>
          )}
        </header>
      )}
      <div className={bodyClass ?? "card-body"}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------- states: empty --- */

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-strong">{title}</div>
      {hint && <div>{hint}</div>}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  );
}

/**
 * Never let a failed request fall through to an empty state — in a
 * mistake-prevention tool, "nothing to check" and "couldn't load the checks"
 * must never look the same.
 */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <IconAlert size={18} />
      <div>
        <strong>Couldn&apos;t load this.</strong>
        <div className="small" style={{ marginTop: 2 }}>
          {message}
        </div>
      </div>
      {onRetry && (
        <button className="btn btn-sm" onClick={onRetry} type="button">
          Try again
        </button>
      )}
    </div>
  );
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton" style={{ width: 20, height: 20, flex: "none" }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 11, width: `${88 - i * 13}%` }} />
            <div
              className="skeleton"
              style={{ height: 9, width: "36%", marginTop: 7, opacity: 0.7 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ tabs -- */

export type TabDef<T extends string> = { id: T; label: string; count?: number };

/**
 * Full ARIA tabs contract: aria-controls onto real tabpanels, roving tabindex
 * and arrow-key navigation. Pair with <TabPanel> using the same idBase.
 */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  idBase,
  label = "Views",
}: {
  tabs: TabDef<T>[];
  active: T;
  onChange: (id: T) => void;
  idBase: string;
  label?: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === active);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    const target = tabs[next];
    onChange(target.id);
    refs.current[target.id]?.focus();
  };

  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            id={`${idBase}-tab-${tab.id}`}
            aria-controls={`${idBase}-panel-${tab.id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className="tab"
            onClick={() => onChange(tab.id)}
            onKeyDown={onKeyDown}
          >
            {tab.label}
            {typeof tab.count === "number" && tab.count > 0 && (
              <span className="count-pill">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  idBase,
  id,
  children,
}: {
  idBase: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${id}`}
      aria-labelledby={`${idBase}-tab-${id}`}
      tabIndex={0}
      className="stack"
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- switch -- */

export function Switch({
  checked,
  onChange,
  disabled,
  label,
  describedBy,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      // aria-disabled (not `disabled`) keeps "coming soon" toggles reachable by
      // keyboard and announced by screen readers.
      aria-disabled={disabled || undefined}
      aria-describedby={describedBy}
      className="switch"
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
    />
  );
}

/* ----------------------------------------------------------------- modal -- */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({
  title,
  onClose,
  children,
  footer,
  onRequestClose,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Return false to veto closing (e.g. unsaved changes). */
  onRequestClose?: () => boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  const attemptClose = useCallback(() => {
    if (onRequestClose && onRequestClose() === false) return;
    onClose();
  }, [onClose, onRequestClose]);

  useEffect(() => {
    if (!mounted) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // The dialog is portalled to <body>, so the whole app shell can be inert.
    const app = document.querySelector<HTMLElement>(".app");
    app?.setAttribute("inert", "");

    // Prefer the first real field over the close button — for a form dialog
    // that's where the user is going anyway.
    const firstField = ref.current?.querySelector<HTMLElement>(
      ".modal-body input:not([type=hidden]), .modal-body textarea, .modal-body select"
    );
    (firstField ?? ref.current?.querySelector<HTMLElement>(FOCUSABLE))?.focus();

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        attemptClose();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const nodes = Array.from(
        ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (nodes.length === 0) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      app?.removeAttribute("inert");
      previouslyFocused?.focus?.();
    };
  }, [attemptClose, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) attemptClose();
      }}
    >
      <div
        className="modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modal-header">
          <h2 className="modal-title" id={titleId}>
            {title}
          </h2>
          <span className="spacer" />
          <button
            className="btn btn-icon"
            onClick={attemptClose}
            aria-label="Close dialog"
            type="button"
          >
            <IconX size={16} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

/* -------------------------------------------------------- confirm button -- */

/**
 * Two-step confirm, reserved for irreversible/cascading actions only.
 * Everything reversible deletes immediately and offers Undo instead.
 */
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = "Confirm",
  className = "btn btn-icon",
  title,
}: {
  onConfirm: () => void;
  children: ReactNode;
  confirmLabel?: string;
  className?: string;
  title?: string;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  if (armed) {
    return (
      <button
        type="button"
        className="btn btn-sm btn-danger"
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={className}
      title={title}
      aria-label={title}
      onClick={() => setArmed(true)}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------ inline add -- */

export function InlineAdd({
  placeholder,
  label,
  onAdd,
  buttonLabel = "Add",
}: {
  placeholder: string;
  /** Real label text — placeholders alone are not accessible names. */
  label: string;
  onAdd: (value: string) => Promise<void> | void;
  buttonLabel?: string;
}) {
  const id = useId();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await onAdd(trimmed);
      setValue("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="inline-form" onSubmit={submit}>
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={busy}
      />
      <button className="btn btn-sm" type="submit" disabled={busy || !value.trim()}>
        <IconPlus size={14} />
        {buttonLabel}
      </button>
    </form>
  );
}

/* ----------------------------------------------------------- inline edit -- */

export function InlineEdit({
  value,
  label,
  onSave,
  onCancel,
}: {
  value: string;
  label: string;
  onSave: (next: string) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);

  const keys = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (draft.trim()) onSave(draft.trim());
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="inline-form" style={{ flex: 1 }}>
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={keys}
      />
      <button
        type="button"
        className="btn btn-sm btn-primary"
        onClick={() => draft.trim() && onSave(draft.trim())}
      >
        Save
      </button>
      <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ misc -- */

export function CommissionDot({ color }: { color: string }) {
  return <span className="dot" style={{ background: color }} />;
}

export function CommissionChip({ name, color }: { name: string; color: string }) {
  return (
    <span className="commission-chip">
      <CommissionDot color={color} />
      {name}
    </span>
  );
}
