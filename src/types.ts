export type Role = "resident" | "service" | "admin";
export type Status = "new" | "work" | "done" | "rejected";
export type CategoryId =
  | "house"
  | "construction"
  | "tires"
  | "hazard"
  | "green"
  | "other";
export type View = "map" | "list" | "stats";

export interface TimelineEvent {
  id: string;
  ts: number;
  type: "created" | "work" | "done" | "rejected" | "reopened";
  text: string;
  actor: string;
}

export interface CommentT {
  id: string;
  ts: number;
  author: string;
  role: Role;
  text: string;
}

export interface Report {
  id: string;
  num: number;
  x: number;
  y: number;
  district: string;
  address: string;
  category: CategoryId;
  description: string;
  status: Status;
  author: string;
  assignee?: string;
  photoBefore?: string;
  photoAfter?: string;
  resolveNote?: string;
  rejectReason?: string;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
  timeline: TimelineEvent[];
  comments: CommentT[];
}

export interface Filters {
  statuses: Status[];
  categories: CategoryId[];
  district: string; // "all" | district name
}

export interface ToastItem {
  id: string;
  text: string;
  tone: "ok" | "info" | "warn";
}
