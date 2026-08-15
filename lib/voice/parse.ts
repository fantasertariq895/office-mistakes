/**
 * Turns a spoken transcript into draft tasks.
 *
 * Deliberately deterministic — no model, no network, no API key. For the way
 * people actually dictate a to-do list ("remind me to X tomorrow, and I need
 * to Y before Friday") plain rules do the job, and they have three properties
 * a model doesn't: the same sentence always produces the same tasks, it costs
 * nothing, and the audio never leaves the machine. If accuracy on real
 * dictation turns out to be too low, swapping in an LLM means replacing this
 * one pure function and nothing else.
 *
 * DATES ARE THE SHARP EDGE HERE. "Tomorrow" means tomorrow in the *speaker's*
 * timezone, and this runs on the client, but the resulting date is stored by a
 * UTC-anchored server (see lib/date.ts, which documents two real bugs caused
 * by exactly this). So every date is computed as pure Y/M/D arithmetic on the
 * caller-supplied local "today" string and emitted as "YYYY-MM-DD" — the form
 * parseDueDate() anchors to UTC. No Date object is ever constructed from a
 * transcript, because `new Date("Friday")` and friends resolve against the
 * runtime's zone, which is precisely the trap.
 */
import type { TaskPriority } from "@/lib/constants";
import type { DraftTask } from "./types";

export type ParseContext = {
  /** "YYYY-MM-DD" — the speaker's local today, from localTodayInputValue(). */
  today: string;
  /** Used to attach a task to a commission when its name is spoken. */
  commissions: { id: number; name: string }[];
};

/* ------------------------------------------------------------ date maths -- */

/** Pure Y/M/D arithmetic; never touches Date, so no timezone can interfere. */
function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  // UTC here is an implementation detail of the arithmetic only — the value
  // goes straight back out as Y/M/D and is never read in local time.
  const t = Date.UTC(y, m - 1, d) + days * 86_400_000;
  const out = new Date(t);
  return `${out.getUTCFullYear()}-${String(out.getUTCMonth() + 1).padStart(2, "0")}-${String(
    out.getUTCDate()
  ).padStart(2, "0")}`;
}

function dayOfWeek(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
}

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

/** "next friday" always skips to the following week; "friday" takes the soonest. */
function nextWeekday(today: string, target: number, forceNextWeek: boolean): string {
  const current = dayOfWeek(today);
  let delta = (target - current + 7) % 7;
  if (delta === 0) delta = 7; // "on Friday" said on a Friday means the next one
  if (forceNextWeek && delta <= 6 && (target - current + 7) % 7 !== 0) {
    // "next Friday" when Friday is still ahead this week -> a week later
    if (delta < 7) delta += 7;
  }
  return addDays(today, delta);
}

type DateHit = { date: string; matched: string } | null;

/**
 * Finds a date expression. Returns the resolved day plus the exact words that
 * produced it, so the review sheet can show why a date was chosen.
 */
export function extractDate(text: string, today: string): DateHit {
  const s = text.toLowerCase();

  if (/\btoday\b|\bthis morning\b|\bthis afternoon\b|\btonight\b/.test(s)) {
    const m = s.match(/\btoday\b|\bthis morning\b|\bthis afternoon\b|\btonight\b/)![0];
    return { date: today, matched: m };
  }
  // Must be tested before bare "tomorrow", which it contains.
  if (/\bday after tomorrow\b/.test(s)) {
    return { date: addDays(today, 2), matched: "day after tomorrow" };
  }
  if (/\btomorrow\b|\btmrw\b/.test(s)) {
    return { date: addDays(today, 1), matched: s.match(/\btomorrow\b|\btmrw\b/)![0] };
  }

  // "in 3 days" / "in two weeks"
  const inN = s.match(/\bin (\d+|a|an|one|two|three|four|five|six|seven) (day|week)s?\b/);
  if (inN) {
    const words: Record<string, number> = {
      a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
    };
    const n = /^\d+$/.test(inN[1]) ? Number(inN[1]) : (words[inN[1]] ?? 1);
    return { date: addDays(today, inN[2] === "week" ? n * 7 : n), matched: inN[0] };
  }

  if (/\bnext week\b/.test(s)) return { date: addDays(today, 7), matched: "next week" };
  if (/\bend of (the )?week\b/.test(s)) {
    return { date: nextWeekday(today, 5, false), matched: "end of the week" };
  }

  // "on the 12th" / "on 12 August" / "August 12"
  const monthDay = s.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)?\b/
  );
  if (monthDay) {
    const month = MONTHS[monthDay[1]];
    const day = Number(monthDay[2]);
    const [ty, tm] = today.split("-").map(Number);
    // If that month/day already passed this year, assume they mean next year.
    const year = month < tm || (month === tm && day < Number(today.split("-")[2])) ? ty + 1 : ty;
    return {
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      matched: monthDay[0],
    };
  }

  // Weekday names, with or without "next"/"by"/"before".
  const wd = s.match(
    /\b(next\s+|by\s+|before\s+|on\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/
  );
  if (wd) {
    const forceNext = (wd[1] ?? "").trim() === "next";
    return { date: nextWeekday(today, WEEKDAYS[wd[2]], forceNext), matched: wd[0].trim() };
  }

  return null;
}

/* -------------------------------------------------------------- priority -- */

const HIGH_SRC =
  "urgent|urgently|asap|critical|important|high priority|right away|immediately|first thing";
const LOW_SRC = "low priority|whenever|no rush|sometime|eventually|if i get time";

const HIGH = new RegExp(`\\b(?:${HIGH_SRC})\\b`, "i");
const LOW = new RegExp(`\\b(?:${LOW_SRC})\\b`, "i");

/**
 * Every priority phrase, global. The title strip has to remove all of them,
 * not just the one that decided the priority — "whenever no rush" set the
 * priority from "whenever" and left "no rush" sitting in the task title.
 */
const PRIORITY_ALL = new RegExp(`\\b(?:${HIGH_SRC}|${LOW_SRC})\\b`, "gi");

function extractPriority(text: string): { priority: TaskPriority; matched: string | null } {
  const high = text.match(HIGH);
  if (high) return { priority: "high", matched: high[0] };
  const low = text.match(LOW);
  if (low) return { priority: "low", matched: low[0] };
  return { priority: "medium", matched: null };
}

/* ------------------------------------------------------------ commission -- */

function extractCommission(
  text: string,
  commissions: { id: number; name: string }[]
): { id: number | null; matched: string | null } {
  const s = text.toLowerCase();
  // Longest name first, so "ActiveX Sales" wins over a hypothetical "ActiveX".
  const sorted = [...commissions].sort((a, b) => b.name.length - a.name.length);
  for (const c of sorted) {
    const name = c.name.toLowerCase();
    if (name.length >= 3 && s.includes(name)) return { id: c.id, matched: c.name };
    // Also try the first word, so "Traffic" matches "Traffic Billing".
    const first = name.split(/\s+/)[0];
    if (first.length >= 4 && new RegExp(`\\b${escapeRe(first)}\\b`).test(s)) {
      return { id: c.id, matched: c.name };
    }
  }
  return { id: null, matched: null };
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ----------------------------------------------------------- splitting --- */

/**
 * Splits dictation into one chunk per task.
 *
 * Speech recognition returns little or no punctuation, so sentence splitting
 * alone is not enough — the reliable signal is the connector people actually
 * say between items ("and then", "also", "after that"). Splitting on those as
 * well as on real punctuation covers both a well-punctuated transcript and a
 * run-on one.
 */
export function splitIntoChunks(transcript: string): string[] {
  const normalised = transcript
    .replace(/\s+/g, " ")
    .replace(
      /\b(?:and\s+then|and\s+also|after\s+that|next\s+up|also,?|then,?|plus,?|additionally,?)\s+/gi,
      " "
    )
    .replace(/\s*(?:[.;!?]|,\s*and\b)\s*/g, " ")
    // "and I need to…" / "and remind me to…" start a new item; a bare "and"
    // in the middle of one ("Kia and Nissan") deliberately does not.
    .replace(
      /\s+and\s+(?=(?:i\s+(?:need|have|want|should|must)\b|remind\b|don'?t\s+forget\b|make\s+sure\b|check\b|send\b|call\b|email\b|follow\s+up\b))/gi,
      " "
    );

  return normalised
    .split(" ")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

/* --------------------------------------------------------------- title ---- */

/** Strips dictation scaffolding so the title reads like a task, not a sentence. */
function toTitle(chunk: string, strip: (string | null)[]): string {
  let t = chunk;

  for (const phrase of strip) {
    if (!phrase) continue;
    t = t.replace(new RegExp(`\\b${escapeRe(phrase)}\\b`, "i"), " ");
  }

  t = t
    .replace(PRIORITY_ALL, " ")
    // Repeated group, not a single strip: "okay um add a task to…" stacks two
    // fillers, and removing only "okay" left "um" blocking the scaffolding
    // pattern below from matching at all.
    .replace(/^(?:\s*(?:um+|uh+|er+|ok(?:ay)?|so|right|well|hey)\b[\s,]*)+/i, "")
    .replace(
      /^\s*(?:please\s+)?(?:remind\s+me\s+to|remember\s+to|don'?t\s+forget\s+to|i\s+need\s+to|i\s+have\s+to|i\s+want\s+to|i\s+should|i\s+must|make\s+sure\s+(?:to|i)|note\s+to\s+self[:,]?|todo[:,]?|to\s+do[:,]?|add\s+(?:a\s+)?task\s+to)\s+/i,
      ""
    )
    // Leftover prepositions from a removed date ("send the file before" -> "send the file")
    .replace(/\s+\b(?:by|before|on|at|due|until|till)\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,;:-]+|[\s,;:-]+$/g, "")
    .trim();

  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* --------------------------------------------------------------- parse ---- */

/** Chunks that are filler rather than a task once scaffolding is removed. */
const MIN_TITLE_WORDS = 2;

export function parseTranscript(
  transcript: string,
  ctx: ParseContext
): DraftTask[] {
  const chunks = splitIntoChunks(transcript);
  const drafts: DraftTask[] = [];

  for (const [i, chunk] of chunks.entries()) {
    const dateHit = extractDate(chunk, ctx.today);
    const prio = extractPriority(chunk);
    const comm = extractCommission(chunk, ctx.commissions);

    const title = toTitle(chunk, [
      dateHit?.matched ?? null,
      prio.matched,
    ]);

    // One-word leftovers are almost always dictation noise ("okay", "right"),
    // not a task worth creating.
    if (!title || title.split(/\s+/).length < MIN_TITLE_WORDS) continue;

    drafts.push({
      id: `d${i}-${title.slice(0, 12).replace(/\W+/g, "")}`,
      title,
      dueDate: dateHit?.date ?? null,
      priority: prio.priority,
      commissionId: comm.id,
      heard: chunk,
      matched: {
        date: dateHit?.matched ?? null,
        priority: prio.matched,
        commission: comm.matched,
      },
    });
  }

  return drafts;
}
