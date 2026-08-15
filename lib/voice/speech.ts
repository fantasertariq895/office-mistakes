"use client";

/**
 * Thin wrapper over the browser's Web Speech API.
 *
 * Chosen over a paid transcription service for v1 because it needs no API key,
 * no billing account and no audio upload of its own — which means the feature
 * works the moment it ships rather than after credentials are provisioned.
 * The trade-off is real and worth knowing: Chrome and Edge are solid, Safari
 * is patchy, Firefox has no support at all, and Chrome relays audio to Google
 * for recognition regardless of anything we do here.
 *
 * Everything is behind this one module so replacing it with Whisper later
 * means rewriting this file and nothing else.
 *
 * The Web Speech types aren't in TypeScript's DOM lib, so the minimum surface
 * is declared here rather than pulling in a dependency for it.
 */

type SpeechAlternative = { transcript: string; confidence: number };
type SpeechResult = { isFinal: boolean; length: number; 0: SpeechAlternative };
type SpeechResultList = { length: number; [i: number]: SpeechResult };

type SpeechEvent = { resultIndex: number; results: SpeechResultList };
type SpeechErrorEvent = { error: string; message?: string };

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechEvent) => void) | null;
  onerror: ((e: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechSupported(): boolean {
  return getCtor() !== null;
}

/**
 * The microphone is only available on a secure origin. Worth checking
 * explicitly: opening the dev server over a LAN IP (http://10.0.0.x:3000) is
 * a normal thing to do for phone testing and silently has no mic, which looks
 * like the feature is broken rather than blocked.
 */
export function isSecureContextForMic(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext || window.location.hostname === "localhost";
}

export type SpeechHandlers = {
  /** Fires continuously: the confirmed text so far plus the in-progress guess. */
  onTranscript: (final: string, interim: string) => void;
  onError: (message: string) => void;
  onEnd: () => void;
};

export type SpeechSession = { stop: () => void };

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed":
    "Microphone access was blocked. Allow it for this site in your browser settings and try again.",
  "service-not-allowed":
    "Microphone access was blocked. Allow it for this site in your browser settings and try again.",
  "no-speech": "Didn't catch anything — try again and speak a little closer to the mic.",
  "audio-capture":
    "No microphone found. Check that one is connected and not in use by another app.",
  network: "The speech service couldn't be reached. Check your connection and try again.",
  aborted: "Recording stopped.",
};

export function startListening(handlers: SpeechHandlers): SpeechSession | null {
  const Ctor = getCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = navigator.language || "en-US";
  // Keep listening through natural pauses — people stop to think mid-list.
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let finalText = "";
  let stoppedByUser = false;

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const chunk = result[0].transcript;
      if (result.isFinal) finalText += chunk + " ";
      else interim += chunk;
    }
    handlers.onTranscript(finalText.trim(), interim.trim());
  };

  recognition.onerror = (event) => {
    // "aborted" is what a deliberate stop() looks like; not worth alarming over.
    if (event.error === "aborted" && stoppedByUser) return;
    handlers.onError(
      ERROR_MESSAGES[event.error] ?? `Speech recognition failed (${event.error}).`
    );
  };

  recognition.onend = () => handlers.onEnd();

  try {
    recognition.start();
  } catch {
    handlers.onError("Couldn't start recording. Try again.");
    return null;
  }

  return {
    stop: () => {
      stoppedByUser = true;
      recognition.stop();
    },
  };
}
