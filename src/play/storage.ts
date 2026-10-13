// Grid of Guilt — /play/ persistence helpers.
//
// Pure TS (no DOM types at module scope, no React) so scripts/selftest.ts can
// import it. Every localStorage access is wrapped in try/catch and every key is
// prefixed `gog-play-`. The whole module must work when storage is empty,
// unavailable (SSR / private mode) or throwing — callers always get a sensible
// default and writes fail silently.

import type { LevelId } from "../app/levels/loadLevel";

export const STORAGE_PREFIX = "gog-play-";

export const LEVEL_ORDER: LevelId[] = ["easy", "medium", "hard"];
export const LEVEL_LABEL: Record<LevelId, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
export const LEVEL_GRID: Record<LevelId, number> = { easy: 5, medium: 7, hard: 9 };

// ── Per-level progress ──────────────────────────────────────────────────────
export interface LevelProgress {
  solved: boolean;
  /** Best (lowest) solve time in whole seconds, or null if never solved. */
  bestSeconds: number | null;
  /** Hints used on the best run. */
  hints: number;
}
export type ProgressMap = Partial<Record<LevelId, LevelProgress>>;

const PROGRESS_KEY = `${STORAGE_PREFIX}progress`;
const TUTORIAL_SEEN_KEY = `${STORAGE_PREFIX}tutorial-seen`;
const levelStateKey = (id: LevelId): string => `${STORAGE_PREFIX}state-${id}`;

// ── Raw access (never throws) ───────────────────────────────────────────────
// localStorage is read through globalThis so this file carries no DOM lib
// dependency; in Node (self-test) it is simply absent and every call defaults.
function store(): Storage | undefined {
  try {
    return (globalThis as { localStorage?: Storage }).localStorage;
  } catch {
    return undefined;
  }
}

function readRaw(key: string): string | null {
  try {
    return store()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): void {
  try {
    store()?.setItem(key, value);
  } catch {
    /* storage full / unavailable — ignore */
  }
}

function removeRaw(key: string): void {
  try {
    store()?.removeItem(key);
  } catch {
    /* ignore */
  }
}

// ── Progress ────────────────────────────────────────────────────────────────
function isLevelProgress(v: unknown): v is LevelProgress {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.solved === "boolean" &&
    (o.bestSeconds === null || typeof o.bestSeconds === "number") &&
    typeof o.hints === "number"
  );
}

export function loadProgress(): ProgressMap {
  const raw = readRaw(PROGRESS_KEY);
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: ProgressMap = {};
    for (const id of LEVEL_ORDER) {
      const entry = (parsed as Record<string, unknown>)[id];
      if (isLevelProgress(entry)) out[id] = entry;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveProgress(progress: ProgressMap): void {
  writeRaw(PROGRESS_KEY, JSON.stringify(progress));
}

// Record a solve: keep the best (lowest) time, and the hint count from that
// best run. Replaying a solved level never worsens the recorded best.
export function recordSolve(id: LevelId, seconds: number, hints: number): ProgressMap {
  const progress = loadProgress();
  const prev = progress[id];
  if (!prev || !prev.solved || prev.bestSeconds === null || seconds < prev.bestSeconds) {
    progress[id] = { solved: true, bestSeconds: seconds, hints };
  } else {
    progress[id] = { ...prev, solved: true };
  }
  saveProgress(progress);
  return progress;
}

// ── Unlock order: Easy open; Medium needs Easy solved; Hard needs Medium. ────
export function isUnlocked(id: LevelId, progress: ProgressMap): boolean {
  if (id === "easy") return true;
  if (id === "medium") return progress.easy?.solved === true;
  return progress.medium?.solved === true; // hard
}

// The gate message for a locked level, or null when it is unlocked.
export function lockMessage(id: LevelId, progress: ProgressMap): string | null {
  if (isUnlocked(id, progress)) return null;
  if (id === "medium") return "Solve Easy to unlock";
  return "Solve Medium to unlock"; // hard
}

// ── Tutorial seen flag ──────────────────────────────────────────────────────
export function getTutorialSeen(): boolean {
  return readRaw(TUTORIAL_SEEN_KEY) === "true";
}
export function setTutorialSeen(seen: boolean): void {
  writeRaw(TUTORIAL_SEEN_KEY, seen ? "true" : "false");
}

// ── In-progress board state (shape finalised in Phase 4) ────────────────────
// Stored/loaded as opaque JSON so this file stays free of PlayBoard's
// figma:asset imports (which can't run under the self-test). The structural
// types below mirror PlayBoard's CellContent / BoardAction without importing
// them, so everything here is JSON-serialisable and framework-free.
export type PersistedCell = number | "X" | "dot" | "skull" | null;
export interface PersistedAction {
  type: "place-suspect" | "place-x" | "remove-x" | "remove-suspect" | "place-dot" | "remove-dot";
  row: number;
  col: number;
  previousContent: PersistedCell;
}
export interface PersistedLevelState {
  grid: PersistedCell[][];
  history: PersistedAction[];
  elapsedSeconds: number;
  hints: number;
}

// Validate a loaded level state enough to trust it; anything malformed makes
// the caller fall back to a fresh board (never crash).
export function isValidLevelState(v: unknown, n: number): v is PersistedLevelState {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (typeof o.elapsedSeconds !== "number" || typeof o.hints !== "number") return false;
  if (!Array.isArray(o.grid) || o.grid.length !== n) return false;
  for (const row of o.grid) {
    if (!Array.isArray(row) || row.length !== n) return false;
  }
  if (!Array.isArray(o.history)) return false;
  return true;
}

export function hasLevelState(id: LevelId): boolean {
  return readRaw(levelStateKey(id)) !== null;
}
export function loadLevelState(id: LevelId, n: number): PersistedLevelState | null {
  const raw = readRaw(levelStateKey(id));
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValidLevelState(parsed, n) ? parsed : null;
  } catch {
    return null;
  }
}
export function saveLevelState(id: LevelId, state: PersistedLevelState): void {
  writeRaw(levelStateKey(id), JSON.stringify(state));
}
export function clearLevelState(id: LevelId): void {
  removeRaw(levelStateKey(id));
}

// ── Debug reset: remove every gog-play- key, then let the caller reload. ─────
export function resetAllProgress(): void {
  const s = store();
  if (!s) return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < s.length; i++) {
      const key = s.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) toRemove.push(key);
    }
    for (const key of toRemove) removeRaw(key);
  } catch {
    /* ignore */
  }
}

// ── Formatting ──────────────────────────────────────────────────────────────
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
