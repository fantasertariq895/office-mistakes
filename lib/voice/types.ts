/**
 * Shapes for the voice-to-tasks feature.
 */
import type { TaskPriority } from "@/lib/constants";

/**
 * One task the parser believes it heard. Nothing is written until the user
 * confirms it in the review sheet, so every field is a proposal, not a fact.
 */
export type DraftTask = {
  /** Stable within one parse, so React keys and edits survive re-renders. */
  id: string;
  title: string;
  /** "YYYY-MM-DD" in the speaker's own calendar, or null for no due date. */
  dueDate: string | null;
  priority: TaskPriority;
  commissionId: number | null;
  /** The words this draft came from — shown so a bad parse is obvious. */
  heard: string;
  /** Which cues fired, for the "why did it pick that?" hint in the UI. */
  matched: {
    date: string | null;
    priority: string | null;
    commission: string | null;
  };
};

export type VoiceNoteRecord = {
  id: number;
  transcript: string;
  taskIds: number[];
  createdAt: string;
};
