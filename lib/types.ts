/**
 * Shapes as they cross the API boundary (dates serialised to ISO strings).
 */
import type { TaskPriority, TaskStatus } from "./constants";

export type Commission = {
  id: number;
  name: string;
  color: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
};

export type ChecklistItem = {
  id: number;
  commissionId: number | null;
  text: string;
  category: string | null;
  isHighRisk: boolean;
  isCustom: boolean;
  checkedAt: string | null;
  sortOrder: number;
  createdAt: string;
};

export type MistakeLogEntry = {
  id: number;
  commissionId: number;
  text: string;
  dateLogged: string;
  resolved: boolean;
};

export type Contact = {
  id: number;
  commissionId: number;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
};

export type ApprovalRequirement = {
  id: number;
  commissionId: number;
  description: string;
};

export type Task = {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  commissionId: number | null;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
  commission?: Pick<Commission, "id" | "name" | "color"> | null;
};

export type NotificationRule = {
  id: number;
  type: string;
  channel: string;
  enabled: boolean;
};

export type AppSettings = {
  id: number;
  pinSet: boolean;
  /** True on a deployment where FORCE_PIN=true — the lock can't be turned off. */
  forcePin: boolean;
  notificationChannels: string[];
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  theme: "light" | "dark";
  updatedAt: string;
};

/** Everything needed to render a commission workspace or inline context panel. */
export type CommissionDetail = Commission & {
  checklistItems: ChecklistItem[];
  mistakes: MistakeLogEntry[];
  contacts: Contact[];
  approvalRequirements: ApprovalRequirement[];
  openTaskCount: number;
};

export type TaskAlert = {
  taskId: number;
  kind: "task_due" | "task_overdue";
  title: string;
  body: string;
};

export type NotificationPoll = {
  dueToday: number;
  overdue: number;
  badge: number;
  alerts: TaskAlert[];
  suppressed: "quiet_hours" | "disabled" | null;
};

/** One-shot payload for the single-canvas Home. */
export type BoardCommission = Commission & {
  checklistItems: ChecklistItem[];
  contacts: Contact[];
  approvalRequirements: ApprovalRequirement[];
  mistakes: MistakeLogEntry[];
  openTaskCount: number;
};

export type BoardData = {
  universal: ChecklistItem[];
  commissions: BoardCommission[];
  /** Present only on the exact request where the new-month reset just ran. */
  monthlyReset: { itemsReset: number; month: string } | null;
};


