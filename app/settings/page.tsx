"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { useApp, type CommissionSummary } from "@/components/AppProvider";
import { IconDownload, IconPencil, IconPlus, IconTrash } from "@/components/icons";
import {
  Card,
  ConfirmButton,
  Empty,
  Modal,
  Switch,
  TabPanel,
  Tabs,
  type TabDef,
} from "@/components/ui";
import { api } from "@/lib/client";
import {
  CHANNEL_PHASE,
  COMMISSION_COLORS,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  type NotificationChannel,
  type NotificationType,
} from "@/lib/constants";
import { useFetch } from "@/lib/hooks";
import type { NotificationRule } from "@/lib/types";

type SettingsTab =
  | "commissions"
  | "notifications"
  | "security"
  | "data"
  | "appearance";

const TABS: TabDef<SettingsTab>[] = [
  { id: "commissions", label: "Commissions" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
  { id: "data", label: "Data" },
  { id: "appearance", label: "Appearance" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("commissions");
  const idBase = useId().replace(/:/g, "");

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Commissions, notifications, lock and backups.
          </p>
        </div>
      </header>

      <Tabs
        tabs={TABS}
        active={tab}
        onChange={setTab}
        idBase={idBase}
        label="Settings sections"
      />

      <div style={{ marginTop: 16, maxWidth: 800 }}>
        <TabPanel idBase={idBase} id={tab}>
          {tab === "commissions" && <CommissionsSection />}
          {tab === "notifications" && <NotificationsSection />}
          {tab === "security" && <SecuritySection />}
          {tab === "data" && <DataSection />}
          {tab === "appearance" && <AppearanceSection />}
        </TabPanel>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- appearance --- */

function AppearanceSection() {
  const { theme, setTheme } = useApp();
  return (
    <Card title="Appearance">
      <div className="toggle-row">
        <div className="toggle-copy" style={{ flex: 1 }}>
          <div className="toggle-title">Dark mode</div>
          <div className="toggle-desc">
            Easier on a second monitor that stays on all day.
          </div>
        </div>
        <Switch
          label="Dark mode"
          checked={theme === "dark"}
          onChange={(next) => setTheme(next ? "dark" : "light")}
        />
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------- commissions --- */

function CommissionsSection() {
  const { commissions, reloadCommissions, bump, pushToast } = useApp();
  const [editing, setEditing] = useState<CommissionSummary | null>(null);
  const [creating, setCreating] = useState(false);

  const remove = async (commission: CommissionSummary) => {
    try {
      await api.del(`/api/commissions/${commission.id}`);
      await reloadCommissions();
      bump();
      pushToast({ title: `Deleted ${commission.name}`, tone: "success" });
    } catch (err) {
      pushToast({
        title: "Could not delete",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  return (
    <div className="stack">
      <Card
        title="Commissions"
        count={commissions.length}
        actions={
          <button className="btn btn-sm" onClick={() => setCreating(true)}>
            <IconPlus size={14} />
            Add
          </button>
        }
        bodyClass="card-body flush"
      >
        {commissions.length === 0 ? (
          <Empty title="No commissions" hint="Add your first one." />
        ) : (
          <div className="list">
            {commissions.map((commission) => {
              const blast =
                commission._count.checklistItems +
                commission._count.contacts +
                commission._count.approvalRequirements +
                commission._count.mistakes;
              return (
                <div className="list-row" key={commission.id}>
                  <span
                    className="dot"
                    style={{ background: commission.color, marginTop: 6 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="list-primary">{commission.name}</div>
                    <div className="list-secondary">
                      {commission._count.checklistItems} checklist ·{" "}
                      {commission._count.contacts} contacts ·{" "}
                      {commission._count.approvalRequirements} approvals ·{" "}
                      {commission._count.mistakes} logged
                    </div>
                  </div>
                  <div className="row-actions">
                    <button
                      className="btn btn-icon"
                      onClick={() => setEditing(commission)}
                      title="Edit"
                      aria-label={`Edit ${commission.name}`}
                    >
                      <IconPencil size={14} />
                    </button>
                    {/* Cascading and unrecoverable, so this one still confirms. */}
                    <ConfirmButton
                      onConfirm={() => remove(commission)}
                      title={`Delete ${commission.name}`}
                      confirmLabel={
                        blast > 0 ? `Delete ${blast} records?` : "Delete?"
                      }
                    >
                      <IconTrash size={14} />
                    </ConfirmButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="callout warning">
        Deleting a commission also deletes its checklist, mistake log, contacts
        and approval requirements, and cannot be undone. Tasks are kept but lose
        the tag.
      </div>

      {(creating || editing) && (
        <CommissionModal
          commission={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CommissionModal({
  commission,
  onClose,
}: {
  commission: CommissionSummary | null;
  onClose: () => void;
}) {
  const { reloadCommissions, bump } = useApp();
  const [name, setName] = useState(commission?.name ?? "");
  const [description, setDescription] = useState(commission?.description ?? "");
  const [color, setColor] = useState(commission?.color ?? COMMISSION_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const payload = { name: name.trim(), description, color };
      if (commission) await api.patch(`/api/commissions/${commission.id}`, payload);
      else await api.post("/api/commissions", payload);
      await reloadCommissions();
      bump();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={commission ? "Edit commission" : "New commission"}
      onClose={onClose}
      footer={
        <>
          {error && <span className="error-text spacer">{error}</span>}
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            form="commission-form"
            disabled={busy || !name.trim()}
          >
            Save
          </button>
        </>
      }
    >
      <form id="commission-form" className="stack" style={{ gap: 14 }} onSubmit={submit}>
        <div className="field">
          <label className="field-label" htmlFor="commission-name">
            Name
          </label>
          <input
            id="commission-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="commission-desc">
            Description
          </label>
          <textarea
            id="commission-desc"
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field">
          <span className="field-label" id="colour-label">
            Colour
          </span>
          <div className="color-swatches" role="group" aria-labelledby="colour-label">
            {COMMISSION_COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                className="color-swatch"
                style={{ background: swatch }}
                aria-pressed={swatch === color}
                onClick={() => setColor(swatch)}
                aria-label={`Colour ${swatch}`}
              />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}


/* -------------------------------------------------------- notifications --- */

function NotificationsSection() {
  const {
    settings,
    reloadSettings,
    desktopPermission,
    requestDesktopPermission,
    pushToast,
  } = useApp();
  const { data, reload } = useFetch<NotificationRule[]>("/api/notification-rules");
  const rules = data ?? [];

  const [quietStart, setQuietStart] = useState<string | null>(null);
  const [quietEnd, setQuietEnd] = useState<string | null>(null);
  const start = quietStart ?? settings?.quietHoursStart ?? "";
  const end = quietEnd ?? settings?.quietHoursEnd ?? "";

  const findRule = (type: NotificationType, channel: NotificationChannel) =>
    rules.find((r) => r.type === type && r.channel === channel);

  const toggle = async (rule: NotificationRule, enabled: boolean) => {
    try {
      await api.patch("/api/notification-rules", { rules: [{ id: rule.id, enabled }] });
      await reload();
    } catch (err) {
      pushToast({
        title: "Could not change that",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  const saveQuietHours = async () => {
    try {
      await api.patch("/api/settings", {
        quietHoursStart: start || null,
        quietHoursEnd: end || null,
      });
      await reloadSettings();
      pushToast({ title: "Quiet hours saved", tone: "success" });
    } catch (err) {
      pushToast({
        title: "Could not save",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    }
  };

  return (
    <div className="stack">
      <Card title="Desktop notifications" subtitle="Web Notifications API">
        <div className="toggle-row">
          <div className="toggle-copy" style={{ flex: 1 }}>
            <div className="toggle-title">
              Browser permission:{" "}
              <span className="muted">
                {desktopPermission === "unsupported"
                  ? "not supported in this browser"
                  : desktopPermission}
              </span>
            </div>
            <div className="toggle-desc">
              Alerts only fire while the dashboard is open. Off-hours delivery
              needs always-on hosting (Phase 3).
            </div>
          </div>
          <button
            className="btn btn-sm"
            disabled={desktopPermission !== "default"}
            onClick={() => void requestDesktopPermission()}
          >
            {desktopPermission === "granted" ? "Enabled" : "Enable"}
          </button>
        </div>

        {desktopPermission === "denied" && (
          <div className="callout warning" style={{ marginTop: 12 }}>
            <strong>Notifications are blocked for this site.</strong> The app
            can&apos;t re-request permission once denied — reset it in the
            browser: click the icon at the left of the address bar (the padlock
            or sliders), find <em>Notifications</em>, set it back to
            &ldquo;Ask&rdquo; or &ldquo;Allow&rdquo;, then reload this page.
            In-app toasts and the sidebar badge keep working either way.
          </div>
        )}
      </Card>

      {NOTIFICATION_CHANNELS.map((channel) => {
        const phase = CHANNEL_PHASE[channel];
        return (
          <Card
            key={channel}
            title={
              <span className="row" style={{ gap: 8 }}>
                {NOTIFICATION_CHANNEL_LABELS[channel]}
                {phase && <span className="coming-soon">{phase} · coming soon</span>}
              </span>
            }
          >
            {NOTIFICATION_TYPES.map((type) => {
              const rule = findRule(type, channel);
              if (!rule) return null;
              const locked = channel !== "in_app" || type === "daily_digest";
              const descId = `desc-${channel}-${type}`;
              return (
                <div className="toggle-row" key={`${channel}-${type}`}>
                  <div className="toggle-copy" style={{ flex: 1 }}>
                    <div className="toggle-title">
                      {NOTIFICATION_TYPE_LABELS[type]}
                    </div>
                    <div className="toggle-desc" id={descId}>
                      {type === "daily_digest"
                        ? "A single morning summary — planned for Phase 2."
                        : channel !== "in_app"
                          ? "Not implemented yet."
                          : "Checked every 5 minutes by the built-in scheduler."}
                    </div>
                  </div>
                  <Switch
                    label={`${NOTIFICATION_CHANNEL_LABELS[channel]} — ${NOTIFICATION_TYPE_LABELS[type]}`}
                    describedBy={descId}
                    checked={rule.enabled}
                    disabled={locked}
                    onChange={(next) => void toggle(rule, next)}
                  />
                </div>
              );
            })}
          </Card>
        );
      })}

      <Card title="Quiet hours" subtitle="Suppress alerts inside this window">
        <div className="field-row">
          <div className="field">
            <label className="field-label" htmlFor="quiet-start">
              From
            </label>
            <input
              id="quiet-start"
              type="time"
              className="input"
              value={start}
              onChange={(e) => setQuietStart(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="quiet-end">
              Until
            </label>
            <input
              id="quiet-end"
              type="time"
              className="input"
              value={end}
              onChange={(e) => setQuietEnd(e.target.value)}
            />
          </div>
        </div>
        <p className="field-hint" style={{ marginTop: 10 }}>
          {start && end
            ? `No alerts between ${start} and ${end}. Make sure that doesn't cover your working day.`
            : "No quiet hours set — alerts can fire any time the app is open."}
        </p>
        <div className="row" style={{ marginTop: 12, gap: 8 }}>
          <button className="btn btn-sm btn-primary" onClick={saveQuietHours}>
            Save quiet hours
          </button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              setQuietStart("");
              setQuietEnd("");
            }}
          >
            Clear
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------- security --- */

function SecuritySection() {
  const { settings, reloadSettings, pushToast } = useApp();
  const pinSet = settings?.pinSet ?? false;
  const forcePin = settings?.forcePin ?? false;

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 8);

  const savePin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pin.length < 4) return setError("PIN must be at least 4 digits");
    if (pin !== confirmPin) return setError("PINs don't match");
    if (!pinSet && !acknowledged) {
      return setError("Please confirm you understand there is no PIN recovery");
    }
    setBusy(true);
    try {
      await api.post("/api/auth/pin", { pin, currentPin });
      setPin("");
      setConfirmPin("");
      setCurrentPin("");
      await reloadSettings();
      pushToast({
        title: pinSet ? "PIN changed" : "PIN lock enabled",
        tone: "success",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save PIN");
    } finally {
      setBusy(false);
    }
  };

  const removePin = async () => {
    setError(null);
    setBusy(true);
    try {
      await api.del("/api/auth/pin", { currentPin });
      setCurrentPin("");
      await reloadSettings();
      pushToast({ title: "PIN lock turned off", tone: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove PIN");
    } finally {
      setBusy(false);
    }
  };

  const lockNow = async () => {
    await api.post("/api/auth/lock");
    window.location.reload();
  };

  return (
    <div className="stack">
      <Card
        title="PIN lock"
        subtitle={forcePin ? "Always on for this deployment" : pinSet ? "On" : "Off"}
      >
        <p className="small muted" style={{ marginBottom: 12 }}>
          This dashboard holds real client and payout data.
          {forcePin
            ? " This deployment requires a PIN — it can't be turned off here."
            : " With a PIN set, the app asks for it on first visit and again after 30 days."}
        </p>

        {!pinSet && (
          <div className="callout danger" style={{ marginBottom: 14 }}>
            <strong>There is no in-app PIN recovery.</strong> Forget it and the
            only way back in is resetting it directly in the database — run{" "}
            <code>npm run db:studio</code> against the same DATABASE_URL this
            app uses (locally or on Neon) and clear the <code>pinHash</code>{" "}
            field on the Settings row. Write the PIN down somewhere safe
            before you turn this on.
          </div>
        )}

        <form className="stack" style={{ gap: 12 }} onSubmit={savePin}>
          {pinSet && (
            <div className="field">
              <label className="field-label" htmlFor="current-pin">
                Current PIN
              </label>
              <input
                id="current-pin"
                className="input"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                value={currentPin}
                onChange={(e) => setCurrentPin(digitsOnly(e.target.value))}
              />
            </div>
          )}
          <div className="field-row">
            <div className="field">
              <label className="field-label" htmlFor="new-pin">
                {pinSet ? "New PIN" : "PIN"}
              </label>
              <input
                id="new-pin"
                className="input"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                placeholder="4–8 digits"
                value={pin}
                onChange={(e) => setPin(digitsOnly(e.target.value))}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="confirm-pin">
                Confirm
              </label>
              <input
                id="confirm-pin"
                className="input"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(digitsOnly(e.target.value))}
              />
            </div>
          </div>

          {!pinSet && (
            <label className="row" style={{ gap: 9, alignItems: "flex-start" }}>
              <input
                type="checkbox"
                className="check-box"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
              <span className="small muted">
                I understand that if I forget this PIN, there is no way to
                recover it from inside the app.
              </span>
            </label>
          )}

          {error && <div className="error-text">{error}</div>}

          <div className="row row-wrap" style={{ gap: 8 }}>
            <button className="btn btn-primary btn-sm" type="submit" disabled={busy}>
              {pinSet ? "Change PIN" : "Enable PIN lock"}
            </button>
            {pinSet && (
              <button type="button" className="btn btn-sm" onClick={lockNow}>
                Lock now
              </button>
            )}
          </div>
        </form>
      </Card>

      {pinSet && !forcePin && (
        <Card title="Turn off the lock">
          <p className="small muted" style={{ marginBottom: 10 }}>
            Enter your current PIN above, then confirm here.
          </p>
          <ConfirmButton
            onConfirm={removePin}
            className="btn btn-sm btn-danger"
            confirmLabel="Yes, remove the lock"
            title="Turn off PIN lock"
          >
            Turn off PIN lock
          </ConfirmButton>
        </Card>
      )}

      {forcePin && (
        <div className="callout">
          The PIN is required by this deployment&apos;s <code>FORCE_PIN</code>{" "}
          environment variable, not by a setting here. To remove it, unset{" "}
          <code>FORCE_PIN</code> in the deployment&apos;s environment
          variables and redeploy.
        </div>
      )}

      <div className="callout">
        {forcePin
          ? "This deployment is publicly reachable behind the forced PIN. Treat the PIN like a real password — anyone with it and the URL sees your data."
          : "The app is local-only by default. Don't expose it beyond your machine without putting real authentication in front of it (PRD §8)."}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- data --- */

function DataSection() {
  const roadmap = [
    {
      title: "Automatic daily backups",
      phase: "Phase 2",
      desc: "Scheduled snapshots of the Postgres database.",
    },
    {
      title: "Weekly reports by email",
      phase: "Phase 2",
      desc: "The Stats page, delivered to your inbox.",
    },
    {
      title: "Outlook / email linking",
      phase: "Phase 3",
      desc: "Attach emails and documents to tasks.",
    },
    {
      title: "AI assistant",
      phase: "Phase 3",
      desc: "“What do I need to do today?”",
    },
    {
      title: "Always-on hosting",
      phase: "Phase 3",
      desc: "Required for overnight and off-hours reminders.",
    },
  ];

  return (
    <div className="stack">
      <Card title="Export" subtitle="Manual backup">
        <div className="toggle-row">
          <div className="toggle-copy" style={{ flex: 1 }}>
            <div className="toggle-title">JSON snapshot</div>
            <div className="toggle-desc">
              Everything — commissions, checklists, mistakes, contacts, approvals
              and tasks — in one readable file.
            </div>
          </div>
          <a className="btn btn-sm" href="/api/export" download>
            <IconDownload size={14} />
            Download
          </a>
        </div>
      </Card>

      <Card title="Database backups">
        <p className="small muted">
          The database is Postgres (Neon), not a local file, so there's no
          single <code>.db</code> file to copy anymore. Neon keeps automatic
          point-in-time backups on its own — check the{" "}
          <strong>Backups</strong> or <strong>Restore</strong> tab in your
          Neon project dashboard. For a manual snapshot you control yourself,
          the JSON export above covers everything except raw internal IDs.
        </p>
      </Card>

      <Card title="Coming later" subtitle="Not built in this version">
        {roadmap.map((item) => {
          const id = `roadmap-${item.title.replace(/\W+/g, "-")}`;
          return (
            <div className="toggle-row" key={item.title}>
              <div className="toggle-copy" style={{ flex: 1 }}>
                <div className="toggle-title">
                  {item.title} <span className="coming-soon">{item.phase}</span>
                </div>
                <div className="toggle-desc" id={id}>
                  {item.desc}
                </div>
              </div>
              <Switch
                label={item.title}
                describedBy={id}
                checked={false}
                disabled
                onChange={() => {}}
              />
            </div>
          );
        })}
      </Card>
    </div>
  );
}
