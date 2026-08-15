"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client";
import { localTodayInputValue, toDateInputValue } from "@/lib/date";
import { parseTranscript } from "@/lib/voice/parse";
import {
  isSecureContextForMic,
  isSpeechSupported,
  startListening,
  type SpeechSession,
} from "@/lib/voice/speech";
import type { DraftTask } from "@/lib/voice/types";
import type { Task } from "@/lib/types";
import { useApp } from "./AppProvider";
import { IconMic, IconTrash, IconX } from "./icons";
import { Modal } from "./ui";

/**
 * Dictate a few tasks, review what was understood, then save.
 *
 * The review step is deliberate rather than saving straight from speech.
 * Recognition mangles the proper nouns this dashboard is full of — "O'Regan",
 * "TRFFK", "Duska" — and silently creating four subtly wrong tasks is worse
 * than creating none, in an app whose entire purpose is not making mistakes.
 */
export function VoiceCapture({ onCreated }: { onCreated: () => void }) {
  const { commissions, pushToast, bump } = useApp();

  const [supported, setSupported] = useState<boolean | null>(null);
  const [secure, setSecure] = useState(true);
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [drafts, setDrafts] = useState<DraftTask[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const session = useRef<SpeechSession | null>(null);

  // Feature detection has to run client-side; assume nothing during SSR.
  useEffect(() => {
    setSupported(isSpeechSupported());
    setSecure(isSecureContextForMic());
  }, []);

  useEffect(() => {
    if (!listening) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [listening]);

  // A live session must not outlive the component.
  useEffect(() => () => session.current?.stop(), []);

  const stop = () => {
    session.current?.stop();
    session.current = null;
    setListening(false);
  };

  const begin = () => {
    setFinalText("");
    setInterimText("");
    setElapsed(0);

    const s = startListening({
      onTranscript: (final, interim) => {
        setFinalText(final);
        setInterimText(interim);
      },
      onError: (message) => {
        setListening(false);
        session.current = null;
        pushToast({ title: "Couldn't record", body: message, tone: "error" });
      },
      onEnd: () => {
        setListening(false);
        session.current = null;
      },
    });

    if (!s) return;
    session.current = s;
    setListening(true);
  };

  /** Stops listening and turns whatever was heard into editable drafts. */
  const review = () => {
    stop();
    const transcript = `${finalText} ${interimText}`.trim();
    if (!transcript) {
      pushToast({ title: "Nothing recorded", tone: "error" });
      return;
    }
    const parsed = parseTranscript(transcript, {
      // The speaker's local day, never the server's — see lib/date.ts.
      today: localTodayInputValue(),
      commissions: commissions.map((c) => ({ id: c.id, name: c.name })),
    });
    if (parsed.length === 0) {
      pushToast({
        title: "Couldn't find any tasks in that",
        body: `Heard: "${transcript}"`,
        tone: "error",
      });
      return;
    }
    setDrafts(parsed);
  };

  const save = async () => {
    if (!drafts || drafts.length === 0) return;
    setSaving(true);
    try {
      const transcript = `${finalText} ${interimText}`.trim();
      const result = await api.post<{ tasks: Task[]; count: number }>("/api/voice/tasks", {
        transcript,
        tasks: drafts.map((d) => ({
          title: d.title,
          dueDate: d.dueDate,
          priority: d.priority,
          commissionId: d.commissionId,
        })),
      });

      const ids = result.tasks.map((t) => t.id);
      setDrafts(null);
      setFinalText("");
      setInterimText("");
      onCreated();
      bump();

      pushToast({
        title: `Added ${result.count} task${result.count === 1 ? "" : "s"}`,
        tone: "success",
        undo: {
          label: "Undo",
          run: async () => {
            await Promise.all(ids.map((id) => api.del(`/api/tasks/${id}`)));
            onCreated();
            bump();
          },
        },
      });
    } catch (err) {
      pushToast({
        title: "Couldn't save those",
        body: err instanceof Error ? err.message : undefined,
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const patch = (id: string, next: Partial<DraftTask>) =>
    setDrafts((prev) => prev?.map((d) => (d.id === id ? { ...d, ...next } : d)) ?? prev);

  const drop = (id: string) =>
    setDrafts((prev) => {
      const next = prev?.filter((d) => d.id !== id) ?? [];
      return next.length === 0 ? null : next;
    });

  if (supported === null) return null;

  if (!supported || !secure) {
    return (
      <button
        type="button"
        className="btn"
        disabled
        title={
          !secure
            ? "The microphone needs a secure connection (https or localhost)."
            : "This browser doesn't support speech recognition — try Chrome or Edge."
        }
      >
        <IconMic size={15} />
        Voice
      </button>
    );
  }

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(
    elapsed % 60
  ).padStart(2, "0")}`;

  return (
    <>
      {listening ? (
        <div className="voice-live" role="status" aria-live="polite">
          <span className="voice-pulse" aria-hidden="true" />
          <span className="voice-time">{mmss}</span>
          <span className="voice-heard">
            {finalText || interimText ? (
              <>
                {finalText}
                {interimText && <em> {interimText}</em>}
              </>
            ) : (
              "Listening…"
            )}
          </span>
          <button type="button" className="btn btn-sm btn-primary" onClick={review}>
            Done
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => {
              stop();
              setFinalText("");
              setInterimText("");
            }}
            aria-label="Cancel recording"
          >
            <IconX size={14} />
          </button>
        </div>
      ) : (
        <button type="button" className="btn" onClick={begin}>
          <IconMic size={15} />
          Voice
        </button>
      )}

      {drafts && (
        <Modal
          title={`Add ${drafts.length} task${drafts.length === 1 ? "" : "s"}?`}
          onClose={() => setDrafts(null)}
          footer={
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDrafts(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Adding…" : `Add ${drafts.length}`}
              </button>
            </>
          }
        >
          <p className="voice-transcript">
            <span className="voice-transcript-label">Heard</span>
            {`${finalText} ${interimText}`.trim()}
          </p>

          <div className="voice-drafts">
            {drafts.map((d) => (
              <div className="voice-draft" key={d.id}>
                <div className="voice-draft-row">
                  <label className="visually-hidden" htmlFor={`vt-${d.id}`}>
                    Task title
                  </label>
                  <input
                    id={`vt-${d.id}`}
                    className="input"
                    value={d.title}
                    onChange={(e) => patch(d.id, { title: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => drop(d.id)}
                    title="Don't add this one"
                    aria-label={`Remove "${d.title}"`}
                  >
                    <IconTrash size={14} />
                  </button>
                </div>

                <div className="voice-draft-fields">
                  <label className="visually-hidden" htmlFor={`vd-${d.id}`}>
                    Due date
                  </label>
                  <input
                    id={`vd-${d.id}`}
                    type="date"
                    className="input"
                    value={d.dueDate ?? ""}
                    onChange={(e) => patch(d.id, { dueDate: e.target.value || null })}
                  />

                  <label className="visually-hidden" htmlFor={`vp-${d.id}`}>
                    Priority
                  </label>
                  <select
                    id={`vp-${d.id}`}
                    className="input"
                    value={d.priority}
                    onChange={(e) =>
                      patch(d.id, { priority: e.target.value as DraftTask["priority"] })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  <label className="visually-hidden" htmlFor={`vc-${d.id}`}>
                    Commission
                  </label>
                  <select
                    id={`vc-${d.id}`}
                    className="input"
                    value={d.commissionId ?? ""}
                    onChange={(e) =>
                      patch(d.id, {
                        commissionId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">No commission</option>
                    {commissions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show the cues that fired, so a wrong guess is explainable
                    rather than mysterious. */}
                {(d.matched.date || d.matched.priority || d.matched.commission) && (
                  <p className="voice-draft-why">
                    from
                    {d.matched.date && (
                      <span className="badge plain">
                        “{d.matched.date}” → {toDateInputValue(d.dueDate)}
                      </span>
                    )}
                    {d.matched.priority && (
                      <span className="badge plain">“{d.matched.priority}”</span>
                    )}
                    {d.matched.commission && (
                      <span className="badge plain">{d.matched.commission}</span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
