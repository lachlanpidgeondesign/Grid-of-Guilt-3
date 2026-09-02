import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import imgSkull from "figma:asset/a3421f4c3e01f93f3d4ecd691c2877bc43bb85f8.png";
import imgRedStripes from "figma:asset/6ef35fa416ded2d3144709b550f95331c3928998.png";
import imgKnifePng from "figma:asset/58d165bd57360408c1c72634c155b7d947ea2f28.png";
import SuspectTile from "../shared/SuspectTile";
import { getRoomBorderEdges, doorSuppressedEdgeSet, DOOR_GAP_FRACTION } from "../shared/boardGeometry";
import { generateLevelAsync, type GeneratedLevel } from "./puzzleGenerator";
import { nextHintFromBoard, type HintResult } from "./constraintSolver";
import { suspectsForSize, type GeneratorSuspect } from "./suspects";
import ClueText from "./ClueText";

// ── Layout tuning ─────────────────────────────────────────────────────
// Single named threshold: at/above this N the board shows avatar-only tokens
// (no name label); below it, avatar + name exactly like the daily game.
export const AVATAR_ONLY_AT_N = 7;

// Daily-game reference constants. At 5x5 the daily game uses
// gridScale = gridSize / 358 and a per-cell reference of 358/5 = 71.6px.
// Two scales keep chrome legible while cells shrink with N:
//   chromeScale = gridSize / 358           (labels, buttons, clue text)
//   cellScale   = cellSize / (358 / 5)     (tokens, in-cell borders, X, skull)
// At N === 5 the two are identical, so the 5x5 layout matches the daily
// proportions exactly.
const REFERENCE_GRID_WIDTH = 358;
const REFERENCE_CELL = REFERENCE_GRID_WIDTH / 5; // 71.6

type GridSize = 5 | 7 | 9;

// A board cell holds a suspect index, an "X" mark, the "skull" crime-scene
// marker, or null. Suspect identity is its index into the level's suspects.
type CellContent = number | "X" | "dot" | "skull" | null;

interface Action {
  type: "place-suspect" | "place-x" | "remove-x" | "remove-suspect" | "place-dot" | "remove-dot";
  row: number;
  col: number;
  previousContent: CellContent;
}

interface GeneratorGameProps {
  onBackToStart: () => void;
}

// ── Constraint checking (generator semantics) ─────────────────────────
interface PlacementErrors {
  crossHatchCells: Set<string>;
  redOutlineCells: Set<string>;
  hasError: boolean;
}

function getPlacementErrors(grid: CellContent[][], N: number, map: number[][]): PlacementErrors {
  const suspects: { idx: number; row: number; col: number }[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const cell = grid[r][c];
      if (typeof cell === "number") suspects.push({ idx: cell, row: r, col: c });
    }
  }

  const crossHatchCells = new Set<string>();
  const redOutlineCells = new Set<string>();
  let hasError = false;

  for (let i = 0; i < suspects.length; i++) {
    for (let j = i + 1; j < suspects.length; j++) {
      const a = suspects[i];
      const b = suspects[j];
      const rowDiff = Math.abs(a.row - b.row);
      const colDiff = Math.abs(a.col - b.col);

      if (a.row === b.row) {
        hasError = true;
        crossHatchCells.add(`${a.row},${a.col}`);
        crossHatchCells.add(`${b.row},${b.col}`);
        for (let c = 0; c < N; c++) redOutlineCells.add(`${a.row},${c}`);
      }
      if (a.col === b.col) {
        hasError = true;
        crossHatchCells.add(`${a.row},${a.col}`);
        crossHatchCells.add(`${b.row},${b.col}`);
        for (let r = 0; r < N; r++) redOutlineCells.add(`${r},${a.col}`);
      }
      if (rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)) {
        hasError = true;
        crossHatchCells.add(`${a.row},${a.col}`);
        crossHatchCells.add(`${b.row},${b.col}`);
        redOutlineCells.add(`${a.row},${a.col}`);
        redOutlineCells.add(`${b.row},${b.col}`);
      }
      if (map[a.row][a.col] === map[b.row][b.col]) {
        hasError = true;
        crossHatchCells.add(`${a.row},${a.col}`);
        crossHatchCells.add(`${b.row},${b.col}`);
        redOutlineCells.add(`${a.row},${a.col}`);
        redOutlineCells.add(`${b.row},${b.col}`);
      }
    }
  }

  return { crossHatchCells, redOutlineCells, hasError };
}

// ── Overlays / icons (ported from the daily game) ─────────────────────
function RedCrossHatch() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 3 }}>
      <img src={imgRedStripes} alt="" className="absolute inset-0 size-full object-cover pointer-events-none" />
    </div>
  );
}

function XMark({ scale = 1 }: { scale?: number }) {
  const size = 32 * scale;
  return (
    <svg className="shrink-0" style={{ width: size, height: size }} fill="none" viewBox="0 0 32 32">
      <path d="M10 10L22 22" stroke="#666666" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M10 22L22 10" stroke="#666666" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

// Neutral "occupied, identity unknown" note the player can place by hand
// (empty → X → dot → empty). A filled circle, no identity. Purely a manual
// scratch mark: it never feeds win-checking or the hint engine.
function DotMark({ scale = 1 }: { scale?: number }) {
  const size = 32 * scale;
  return (
    <svg className="shrink-0" style={{ width: size, height: size }} fill="none" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="5.5" fill="#666666" />
    </svg>
  );
}

// Neutral diagonal-stripe overlay marking a hint's target cells (mirrors the
// daily game's striped "eliminate these" affordance, without a raster asset).
function HintStripes() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: 3,
        backgroundImage: "repeating-linear-gradient(45deg, rgba(1,57,75,0.28) 0, rgba(1,57,75,0.28) 3px, transparent 3px, transparent 7px)",
      }}
    />
  );
}

// Grey hint banner matching the daily game's HintBanner styling.
function HintBanner({ text, scale = 1 }: { text: string; scale?: number }) {
  const padding = Math.max(8, 12 * scale);
  const fontSize = Math.max(11, 15 * scale);
  const borderRadius = 8 * scale;
  return (
    <div className="relative shrink-0 w-full" style={{ backgroundColor: "#e6ebed", borderRadius, padding }}>
      <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: 0, border: "1px solid #678893", borderRadius }} />
      <p
        className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-black"
        style={{ fontSize, lineHeight: 1.35 }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}

function SkullIcon({ scale = 1 }: { scale?: number }) {
  const size = 48 * scale;
  return (
    <img
      src={imgSkull}
      alt="Murder location"
      className="shrink-0 object-contain pointer-events-none"
      style={{ width: size, height: size }}
    />
  );
}

// ── Door / window markers ─────────────────────────────────────────────
// Inlined verbatim from the "Windows/Door.svg" and "Windows/Window.svg"
// assets (viewBox 0 0 33 7, a horizontal pill). Fills/strokes are kept
// exactly as the assets define them (orange door / blue window, black
// stroke) — NOT converted to currentColor. The asset is drawn for a
// HORIZONTAL wall; vertical walls rotate it 90° at the call site.
const MARKER_VIEWBOX = "0 0 33 7";
const MARKER_ASPECT = 7 / 33; // height / length

function DoorMarker() {
  return (
    <svg viewBox={MARKER_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect x="0.5" y="0.5" width="32" height="6" rx="3" fill="#FE9B00" stroke="black" />
      <circle cx="26" cy="3.5" r="1.5" fill="#573603" />
    </svg>
  );
}

function WindowMarker() {
  return (
    <svg viewBox={MARKER_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect x="0.5" y="0.5" width="32" height="6" rx="3" fill="#8BD6F9" stroke="black" />
      <path d="M16.5 5L16.5 2" stroke="black" />
    </svg>
  );
}

// Single absolutely-positioned overlay that draws every door and window for
// the level. It covers the whole board (gridSize x gridSize), is pointer-
// events:none (so it never intercepts drag/tap — getCellFromPointer reads the
// grid container, not this layer), and sits above the cell walls but below
// the tokens (token/skull cells are elevated at the cell level). Each marker
// is centred on its wall segment and rotated per the entry's dir/side.
function DoorWindowOverlay({ level, cellSize }: { level: GeneratedLevel; cellSize: number }) {
  const pillLen = cellSize * DOOR_GAP_FRACTION;
  const pillThick = pillLen * MARKER_ASPECT;

  type Placed = { key: string; cx: number; cy: number; rot: number; kind: "door" | "window" };
  const placed: Placed[] = [];

  for (const d of level.doors) {
    if (d.dir === "down") {
      // horizontal interior wall between (r,c) and (r+1,c)
      placed.push({ key: `d-${d.r}-${d.c}-down`, cx: (d.c + 0.5) * cellSize, cy: (d.r + 1) * cellSize, rot: 0, kind: "door" });
    } else {
      // vertical interior wall between (r,c) and (r,c+1)
      placed.push({ key: `d-${d.r}-${d.c}-right`, cx: (d.c + 1) * cellSize, cy: (d.r + 0.5) * cellSize, rot: 90, kind: "door" });
    }
  }
  for (const w of level.windows) {
    // Windows sit ON the board's outer perimeter wall, centred on the wall
    // line so they straddle it 50/50 — exactly how a door straddles its
    // interior wall. The wall underneath is NOT broken; the window sits on top.
    if (w.side === "top") placed.push({ key: `w-${w.r}-${w.c}-top`, cx: (w.c + 0.5) * cellSize, cy: w.r * cellSize, rot: 0, kind: "window" });
    else if (w.side === "bottom") placed.push({ key: `w-${w.r}-${w.c}-bottom`, cx: (w.c + 0.5) * cellSize, cy: (w.r + 1) * cellSize, rot: 0, kind: "window" });
    else if (w.side === "left") placed.push({ key: `w-${w.r}-${w.c}-left`, cx: w.c * cellSize, cy: (w.r + 0.5) * cellSize, rot: 90, kind: "window" });
    else placed.push({ key: `w-${w.r}-${w.c}-right`, cx: (w.c + 1) * cellSize, cy: (w.r + 0.5) * cellSize, rot: 90, kind: "window" });
  }

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
      {placed.map((p) => (
        <div
          key={p.key}
          className="absolute"
          style={{
            left: p.cx,
            top: p.cy,
            width: pillLen,
            height: pillThick,
            transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
            transformOrigin: "center",
          }}
        >
          {p.kind === "door" ? <DoorMarker /> : <WindowMarker />}
        </div>
      ))}
    </div>
  );
}

// Room name labels. Decorative and pointer-events:none. Styled as pill badges
// matching the daily game's label sizing/structure (opaque room-colour fill,
// darker border, soft drop shadow, uppercase) — using the app's Inter font
// rather than the daily PNG's typeface. Placement rules:
//  • First word only of the room name (option 2 for 9x9 legibility).
//  • STRADDLES the room's top border, horizontally centred across the room's
//    own top-row span (so an L/U-shaped region stays anchored to itself).
//  • Positions are FIXED — labels are never moved to avoid a collision. If a
//    level would place two labels on top of each other, or a label on top of a
//    top-edge door/window, the whole puzzle is regenerated instead (see
//    roomLabelsClash + the generation loop).
// Raised above the token layer per design request; since labels sit at the top
// of a room (where suspects rarely are) this keeps them legible.

interface LabelPlacement {
  key: string;
  row: number;
  centerX: number;
  centerY: number;
  name: string;
  dark: string;
  fill: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface LabelLayout {
  placements: LabelPlacement[];
  pillH: number;
  fontSize: number;
  padX: number;
  borderW: number;
  cellScale: number;
}

// Pure, deterministic label layout. Straddled on the top border; NO nudging.
// Shared by the renderer and the pre-flight clash check so the two can't drift.
function computeRoomLabelLayout(level: GeneratedLevel, cellSize: number, cellScale: number): LabelLayout {
  const map = level.map;
  const N = map.length;

  const pillH = Math.max(13, 22 * cellScale);
  const fontSize = Math.max(7, 11 * cellScale);
  const padX = Math.max(4, 8 * cellScale);
  const borderW = Math.max(1, 2 * cellScale);
  // Rough on-screen pill width (no DOM measure): bold uppercase Inter averages
  // ~0.66em/char; add horizontal padding + borders.
  const estWidth = (name: string) => name.length * fontSize * 0.66 + padX * 2 + borderW * 2;

  const cellsByRoom = new Map<number, Array<[number, number]>>();
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const idx = map[r][c] as number;
      const arr = cellsByRoom.get(idx) ?? [];
      arr.push([r, c]);
      cellsByRoom.set(idx, arr);
    }
  }

  const placements: LabelPlacement[] = [];
  for (const [idx, cells] of cellsByRoom) {
    const minRow = Math.min(...cells.map(([r]) => r));
    const topRow = cells.filter(([r]) => r === minRow).map(([, c]) => c).sort((a, b) => a - b);
    const spanCenterCol = (topRow[0] + topRow[topRow.length - 1] + 1) / 2;
    const centerX = spanCenterCol * cellSize;
    const centerY = minRow * cellSize; // straddle the top border line
    const name = level.rooms[idx].name.split(" ")[0];
    const w = estWidth(name);
    placements.push({
      key: `rl-${idx}`,
      row: minRow,
      centerX,
      centerY,
      name,
      dark: level.rooms[idx].dark,
      fill: level.rooms[idx].fill,
      x0: centerX - w / 2,
      x1: centerX + w / 2,
      y0: centerY - pillH / 2,
      y1: centerY + pillH / 2,
    });
  }

  return { placements, pillH, fontSize, padX, borderW, cellScale };
}

// Would this level's fixed-position labels collide with each other or with a
// top-edge door/window? Evaluated at the 5x5 reference scale (representative;
// labels are floored in size so this is the worst realistic case). Used to
// reject a level and regenerate rather than move a label.
function roomLabelsClash(level: GeneratedLevel): boolean {
  const cs = REFERENCE_CELL;
  const gap = 3;
  const { placements } = computeRoomLabelLayout(level, cs, 1);

  // Label vs label.
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const a = placements[i];
      const b = placements[j];
      if (a.x0 < b.x1 + gap && a.x1 > b.x0 - gap && a.y0 < b.y1 + gap && a.y1 > b.y0 - gap) return true;
    }
  }

  // Label vs top-edge marker (door/window on the same border the label straddles).
  const topMarkers: Array<[number, number]> = [];
  for (const w of level.windows) if (w.side === "top") topMarkers.push([w.r, w.c]);
  for (const key of doorSuppressedEdgeSet(level.doors)) {
    if (key.endsWith(",top")) {
      const [r, c] = key.slice(0, key.lastIndexOf(",")).split(",").map(Number);
      topMarkers.push([r, c]);
    }
  }
  for (const p of placements) {
    for (const [r, c] of topMarkers) {
      if (r !== p.row) continue;
      const mx0 = c * cs;
      const mx1 = (c + 1) * cs;
      if (p.x0 < mx1 && p.x1 > mx0) return true;
    }
  }

  return false;
}

function RoomLabels({
  level, cellSize, cellScale,
}: {
  level: GeneratedLevel;
  cellSize: number;
  cellScale: number;
}) {
  const { placements, pillH, fontSize, padX, borderW } = computeRoomLabelLayout(level, cellSize, cellScale);
  const radius = pillH / 2;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 9 }}>
      {placements.map((p) => (
        <div
          key={p.key}
          className="absolute font-['Inter:Bold',sans-serif] font-bold flex items-center justify-center whitespace-nowrap"
          style={{
            left: p.centerX,
            top: p.centerY,
            transform: "translate(-50%, -50%)",
            height: pillH,
            padding: `0 ${padX}px`,
            fontSize,
            lineHeight: 1,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            color: "#fcfcfc",
            backgroundColor: p.fill,
            border: `${borderW}px solid ${p.dark}`,
            borderRadius: radius,
            boxShadow: `0px ${Math.max(1, 1.5 * cellScale)}px ${Math.max(2, 3 * cellScale)}px rgba(0,0,0,0.18)`,
          }}
        >
          {p.name}
        </div>
      ))}
    </div>
  );
}

function ErrorBanner({ scale = 1 }: { scale?: number }) {
  const padding = Math.max(8, 12 * scale);
  const fontSize = Math.max(11, 15 * scale);
  const borderRadius = 8 * scale;
  return (
    <div className="relative shrink-0 w-full" style={{ backgroundColor: "#ffcbcb", borderRadius, padding }}>
      <div aria-hidden="true" className="absolute pointer-events-none" style={{ inset: 0, border: "1px solid red", borderRadius }} />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-black" style={{ fontSize, lineHeight: 1.35 }}>
        Oops! Suspects can't share a row, column, room, or touch each other.
      </p>
    </div>
  );
}

// ── Header (shared shell) ─────────────────────────────────────────────
function GeneratorHeader({ onBack, showBack = true }: { onBack: () => void; showBack?: boolean }) {
  return (
    <div className="h-[44px] shrink-0 w-full relative z-10 bg-[#01394b]">
      <div aria-hidden="true" className="absolute border-[#678893] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex items-center justify-center size-full">
        <div className="flex items-center justify-between px-[12px] w-full max-w-[500px]">
          {showBack ? (
            <button onClick={onBack} className="shrink-0 size-[24px] cursor-pointer bg-transparent border-none p-0" aria-label="Back to start">
              <svg className="block size-full" fill="none" viewBox="0 0 24 24">
                <path d="M15 18L9 12L15 6" stroke="#fcfcfc" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          ) : (
            <div className="w-[24px]" />
          )}
          <div className="shrink-0" style={{ width: 31.359, height: 28, filter: "drop-shadow(0px 1.16px 0px #678893)" }}>
            <img src={imgKnifePng} alt="Knife" className="block size-full object-contain" />
          </div>
          <div className="w-[24px]" />
        </div>
      </div>
    </div>
  );
}

// ── Control bar: size / regenerate / reveal / back + status slot. ─────
// Presents the outer's async generation state (generating / failed) and the
// inner's play state (solved / revealed); it does not own any async itself.
function GeneratorControls({
  size, onSize, onRegenerate, onReveal, onBack, generating, failed, genAttempt, gameWon, revealed,
}: {
  size: GridSize;
  onSize: (n: GridSize) => void;
  onRegenerate: () => void;
  onReveal: () => void;
  onBack: () => void;
  generating: boolean;
  failed: boolean;
  genAttempt: number;
  gameWon: boolean;
  revealed: boolean;
}) {
  const sizes: GridSize[] = [5, 7, 9];
  const btn = "px-[12px] py-[6px] text-[13px] font-['Inter',sans-serif] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
  return (
    <div className="w-full max-w-[500px] px-[16px] pt-[8px] pb-[6px] shrink-0 flex flex-col gap-[6px]">
      <div className="flex items-center gap-[8px] flex-wrap">
        <button
          onClick={onBack}
          className={`${btn} rounded-[50px] border border-[#678893] bg-[#fcfcfc] text-[#191919] flex items-center gap-[4px]`}
          aria-label="Back to start"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="#191919" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          Back
        </button>
        <div className="flex rounded-[50px] overflow-hidden border border-[#678893]">
          {sizes.map((n) => (
            <button
              key={n}
              onClick={() => onSize(n)}
              disabled={generating}
              className={btn}
              style={{ backgroundColor: size === n ? "#01394b" : "#fcfcfc", color: size === n ? "#fcfcfc" : "#191919" }}
            >
              {n}×{n}
            </button>
          ))}
        </div>
        <button
          onClick={onRegenerate}
          disabled={generating}
          className={`${btn} rounded-[50px] border border-[#678893] bg-[#fcfcfc] text-[#191919]`}
        >
          Regenerate
        </button>
        <button
          onClick={onReveal}
          disabled={generating || gameWon || revealed}
          className={`${btn} rounded-[50px] border border-[#678893] bg-[#e6ebed] text-[#191919]`}
        >
          Reveal
        </button>
      </div>
      <div className="min-h-[18px] flex items-center gap-[8px]">
        {generating ? (
          <span className="text-[12px] font-['Inter',sans-serif] text-[#678893]">Generating {size}×{size}…{genAttempt > 1 ? ` (attempt ${genAttempt})` : ""}</span>
        ) : failed ? (
          <>
            <span className="text-[12px] font-['Inter',sans-serif] text-[#191919]">Couldn't generate a {size}×{size} puzzle.</span>
            <button onClick={onRegenerate} className="text-[12px] font-['Inter',sans-serif] font-semibold text-[#01394b] underline cursor-pointer bg-transparent border-none p-0">Retry</button>
          </>
        ) : gameWon ? (
          <span className="text-[12px] font-['Inter',sans-serif] font-semibold text-[#01394b]">Solved</span>
        ) : revealed ? (
          <span className="text-[12px] font-['Inter',sans-serif] font-semibold text-[#678893]">Revealed</span>
        ) : (
          <span className="text-[12px]">&nbsp;</span>
        )}
      </div>
    </div>
  );
}

// ── Outer: async generation orchestration ─────────────────────────────
export default function GeneratorGame({ onBackToStart }: GeneratorGameProps) {
  const [size, setSize] = useState<GridSize>(5);
  const [level, setLevel] = useState<GeneratedLevel | null>(null);
  // Monotonic id bumped every time a NEW level is APPLIED (initial, size
  // change, or regenerate). Used as the inner component's React key so the
  // play screen always remounts with a grid built from the level in scope —
  // there is never a render where `level` is new but `grid` is the old size.
  const [levelId, setLevelId] = useState(0);
  const [generating, setGenerating] = useState(true);
  const [genFailed, setGenFailed] = useState(false);
  // Coarse progress for slow (9×9) generation: which outer attempt we're on.
  const [genAttempt, setGenAttempt] = useState(0);
  const genIdRef = useRef(0);

  const runGeneration = useCallback((n: GridSize) => {
    const myId = ++genIdRef.current;
    setGenerating(true);
    setGenFailed(false);
    setGenAttempt(0);
    // Labels have FIXED positions; rather than move a colliding label we reject
    // the level and generate another. Cap the retries so a pathological run
    // can't spin forever — after the cap we accept the last level (a rare,
    // slightly-overlapping label beats an endless spinner).
    const MAX_LABEL_RETRIES = 15;
    const attempt = (tries: number) => {
      generateLevelAsync(n, {
        isCancelled: () => genIdRef.current !== myId,
        onProgress: (a) => { if (genIdRef.current === myId) setGenAttempt(a); },
      }).then((lvl) => {
        if (genIdRef.current !== myId) return; // superseded by a newer request
        if (!lvl) {
          setGenFailed(true);
          setGenerating(false);
          return;
        }
        if (tries < MAX_LABEL_RETRIES && roomLabelsClash(lvl)) {
          attempt(tries + 1); // labels would overlap → regenerate
          return;
        }
        // setLevel + setLevelId commit together (same microtask) so the
        // remount and the new level are always observed in the same render.
        setLevel(lvl);
        setLevelId((n2) => n2 + 1);
        setGenerating(false);
      });
    };
    attempt(0);
  }, []);

  useEffect(() => { runGeneration(size); }, [size, runGeneration]);

  const changeSize = useCallback((n: GridSize) => { setSize(n); }, []);
  const regenerate = useCallback(() => { runGeneration(size); }, [size, runGeneration]);

  // First load (no level yet): full-screen generating / failure.
  if (!level) {
    return (
      <div className="fixed inset-0 flex flex-col bg-[#fcfcfc]" style={{ zIndex: 10000 }}>
        <GeneratorHeader onBack={onBackToStart} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          {generating ? (
            <div className="flex flex-col items-center gap-1">
              <p className="font-['Inter',sans-serif] text-[15px] text-[#678893]">Generating {size}×{size}…{genAttempt > 1 ? ` (attempt ${genAttempt})` : ""}</p>
              {size >= 9 ? (
                <p className="font-['Inter',sans-serif] text-[12px] text-[#678893]">Large boards can take a few seconds.</p>
              ) : null}
            </div>
          ) : (
            <>
              <p className="font-['Inter',sans-serif] text-[15px] text-[#191919]">Could not generate a {size}×{size} puzzle.</p>
              <button
                className="bg-[#01394b] text-[#fcfcfc] rounded-[50px] px-[24px] py-[10px] font-['Inter',sans-serif] font-semibold text-[15px] cursor-pointer border-none"
                onClick={regenerate}
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <GeneratorGameInner
      key={levelId}
      level={level}
      size={size}
      onSize={changeSize}
      onRegenerate={regenerate}
      onBack={onBackToStart}
      generating={generating}
      failed={genFailed}
      genAttempt={genAttempt}
    />
  );
}

// ── Inner: the play screen. Assumes a non-null level. ─────────────────
function GeneratorGameInner({
  level, size, onSize, onRegenerate, onBack, generating, failed, genAttempt,
}: {
  level: GeneratedLevel;
  size: GridSize;
  onSize: (n: GridSize) => void;
  onRegenerate: () => void;
  onBack: () => void;
  generating: boolean;
  failed: boolean;
  genAttempt: number;
}) {
  const N = level.N;
  const map = level.map;
  const suspects: GeneratorSuspect[] = suspectsForSize(N);
  const isLargeN = N >= AVATAR_ONLY_AT_N;
  const showNameOnBoard = !isLargeN;

  const [starterRow, starterCol] = level.sol[level.starterIdx];
  const crime = level.crimeSceneCell;

  const buildInitialGrid = useCallback((): CellContent[][] => {
    const g: CellContent[][] = Array.from({ length: N }, () => Array<CellContent>(N).fill(null));
    g[starterRow][starterCol] = level.starterIdx;
    if (crime) g[crime[0]][crime[1]] = "skull";
    return g;
  }, [N, starterRow, starterCol, crime, level.starterIdx]);

  // Every N-sized state atom below is initialised from `level` at mount, and
  // the component only ever mounts against one level (the outer keys it by
  // levelId). There is therefore no reset effect and no window in which any
  // of these can disagree with `level`:
  //   • grid           — built N×N from level (starter + skull pre-placed)
  //   • actionHistory   — empty; only ever holds cells from THIS grid
  //   • selectedSuspect — null; a suspect index only set by user interaction
  //   • gameWon         — false
  // Nothing here indexes level.sol / clues / suspects with a stale N.
  const [grid, setGrid] = useState<CellContent[][]>(buildInitialGrid);
  const [selectedSuspect, setSelectedSuspect] = useState<number | null>(null);
  const [actionHistory, setActionHistory] = useState<Action[]>([]);
  const [gameWon, setGameWon] = useState(false);
  // Reveal is distinct from winning: it fills the board from `sol` and locks
  // input, but the level is NOT solved. Kept separate from gameWon so the
  // status reads "Revealed", never "Solved".
  const [revealed, setRevealed] = useState(false);
  // Hint state. `cells` are highlighted (others dim); `pendingCells` are striped
  // targets. Escalation for repeated presses on the SAME step is tracked by a
  // signature + level; any board change clears it (see the [grid] effect below).
  const [hintData, setHintData] = useState<{ text: string; cells: Set<string>; pendingCells: Set<string> } | null>(null);
  const hintSigRef = useRef<string>("");
  const hintLevelRef = useRef(0);
  const [gridSize, setGridSizePx] = useState(300);
  const [layoutReady, setLayoutReady] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);

  // Drag & drop state
  const [dragState, setDragState] = useState<{ idx: number; fromGrid: [number, number] | null } | null>(null);
  const dragPosRef = useRef({ x: 0, y: 0 });
  const floatingRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, moved: false });
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const xPaintingRef = useRef<{ active: boolean; placedCells: { row: number; col: number; prev: CellContent }[] }>({ active: false, placedCells: [] });
  const gridRef = useRef(grid);
  gridRef.current = grid;

  const isPinned = (row: number, col: number): boolean => {
    if (row === starterRow && col === starterCol) return true;
    if (crime && row === crime[0] && col === crime[1]) return true;
    return false;
  };

  // ── Win detection (generator semantics; sol is NOT consulted) ─────────
  const checkWin = useCallback((g: CellContent[][]): boolean => {
    const pos: Array<[number, number] | null> = Array.from({ length: N }, () => null);
    let placedCount = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = g[r][c];
        if (typeof cell === "number") { pos[cell] = [r, c]; placedCount++; }
      }
    }
    if (placedCount !== N) return false;
    if (getPlacementErrors(g, N, map).hasError) return false;
    for (let si = 0; si < N; si++) {
      const p = pos[si];
      if (!p) return false;
      if (!level.clues[si].check(p[0], p[1])) return false;
    }
    return true;
  }, [N, map, level.clues]);

  // ── Scales ───────────────────────────────────────────────────────────
  const cellSize = gridSize / N;
  const chromeScale = gridSize / REFERENCE_GRID_WIDTH;
  const cellScale = cellSize / REFERENCE_CELL; // === chromeScale when N === 5

  // ── Pointer helpers ──────────────────────────────────────────────────
  const getCellFromPointer = (clientX: number, clientY: number): [number, number] | null => {
    const gc = gridContainerRef.current;
    if (!gc) return null;
    const rect = gc.getBoundingClientRect();
    const cs = gridSize / N;
    const col = Math.floor((clientX - rect.left) / cs);
    const row = Math.floor((clientY - rect.top) / cs);
    if (row >= 0 && row < N && col >= 0 && col < N) return [row, col];
    return null;
  };

  const isOverTray = (clientX: number, clientY: number): boolean => {
    const tray = trayRef.current;
    if (!tray) return false;
    const rect = tray.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
  };

  const cellTileSize = 64 * cellScale;

  const updateFloatingPos = (clientX: number, clientY: number) => {
    dragPosRef.current = { x: clientX, y: clientY };
    if (floatingRef.current) {
      floatingRef.current.style.transform = `translate(${clientX - cellTileSize / 2}px, ${clientY - cellTileSize / 2}px)`;
    }
  };

  // ── Tap-to-place / toggle X / pick up ────────────────────────────────
  const handleCellClick = (row: number, col: number) => {
    if (gameWon || revealed) return;
    const current = grid[row][col];
    if (isPinned(row, col)) return;

    if (selectedSuspect !== null) {
      if (typeof current === "number") { setSelectedSuspect(null); return; }
      const newGrid = grid.map((r) => [...r]);
      newGrid[row][col] = selectedSuspect;
      setGrid(newGrid);
      setActionHistory((h) => [...h, { type: "place-suspect", row, col, previousContent: current }]);
      setSelectedSuspect(null);
      if (checkWin(newGrid)) setGameWon(true);
    } else {
      // Empty cells cycle empty → X → dot → empty. The dot is a purely manual
      // "someone is here, identity unknown" scratch note; it takes no part in
      // win-checking or hints.
      if (current === null) {
        const newGrid = grid.map((r) => [...r]);
        newGrid[row][col] = "X";
        setGrid(newGrid);
        setActionHistory((h) => [...h, { type: "place-x", row, col, previousContent: null }]);
      } else if (current === "X") {
        const newGrid = grid.map((r) => [...r]);
        newGrid[row][col] = "dot";
        setGrid(newGrid);
        setActionHistory((h) => [...h, { type: "place-dot", row, col, previousContent: "X" }]);
      } else if (current === "dot") {
        const newGrid = grid.map((r) => [...r]);
        newGrid[row][col] = null;
        setGrid(newGrid);
        setActionHistory((h) => [...h, { type: "remove-dot", row, col, previousContent: "dot" }]);
      } else if (typeof current === "number") {
        const newGrid = grid.map((r) => [...r]);
        newGrid[row][col] = null;
        setGrid(newGrid);
        setActionHistory((h) => [...h, { type: "remove-suspect", row, col, previousContent: current }]);
      }
    }
  };

  const handleSuspectClick = (idx: number) => {
    if (gameWon || revealed) return;
    setSelectedSuspect((prev) => (prev === idx ? null : idx));
  };

  // ── Drag (tray or grid) ──────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent, idx: number, fromGrid: [number, number] | null) => {
    if (gameWon || revealed) return;
    if (fromGrid && isPinned(fromGrid[0], fromGrid[1])) return;
    e.preventDefault();
    try { (e.target as Element).setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    const preventScroll = (te: TouchEvent) => te.preventDefault();
    document.addEventListener("touchmove", preventScroll, { passive: false });
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    const startFromGrid = fromGrid;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - dragStartRef.current.x;
      const dy = ev.clientY - dragStartRef.current.y;
      if (!dragStartRef.current.moved && Math.sqrt(dx * dx + dy * dy) > 5) {
        dragStartRef.current.moved = true;
        if (startFromGrid) {
          setGrid((prev) => {
            const ng = prev.map((r) => [...r]);
            ng[startFromGrid[0]][startFromGrid[1]] = null;
            return ng;
          });
        }
        setSelectedSuspect(null);
        setDragState({ idx, fromGrid: startFromGrid });
        updateFloatingPos(ev.clientX, ev.clientY);
      }
      if (dragStartRef.current.moved) updateFloatingPos(ev.clientX, ev.clientY);
    };

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("touchmove", preventScroll);
      if (!dragStartRef.current.moved) {
        if (startFromGrid) handleCellClick(startFromGrid[0], startFromGrid[1]);
        else handleSuspectClick(idx);
        return;
      }
      const cell = getCellFromPointer(ev.clientX, ev.clientY);
      const overTray = isOverTray(ev.clientX, ev.clientY);

      setGrid((prev) => {
        const ng = prev.map((r) => [...r]);
        if (cell) {
          const [row, col] = cell;
          const targetCell = ng[row][col];
          if ((targetCell === null || targetCell === "X") && !isPinned(row, col)) {
            ng[row][col] = idx;
            if (startFromGrid) {
              setActionHistory((h) => [...h,
                { type: "remove-suspect", row: startFromGrid[0], col: startFromGrid[1], previousContent: idx },
                { type: "place-suspect", row, col, previousContent: targetCell },
              ]);
            } else {
              setActionHistory((h) => [...h, { type: "place-suspect", row, col, previousContent: targetCell }]);
            }
            if (checkWin(ng)) setGameWon(true);
          } else {
            if (startFromGrid) ng[startFromGrid[0]][startFromGrid[1]] = idx;
          }
        } else if (overTray && startFromGrid) {
          setActionHistory((h) => [...h, { type: "remove-suspect", row: startFromGrid[0], col: startFromGrid[1], previousContent: idx }]);
        } else {
          if (startFromGrid) ng[startFromGrid[0]][startFromGrid[1]] = idx;
        }
        return ng;
      });
      setDragState(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // ── X-painting (drag-paint) ──────────────────────────────────────────
  const handleGridPointerDown = (e: React.PointerEvent, row: number, col: number) => {
    if (gameWon || revealed) return;
    if (selectedSuspect !== null) { handleCellClick(row, col); return; }
    if (dragState) return;
    if (isPinned(row, col)) return;
    const content = gridRef.current[row][col];
    // Empty / X / dot cells are interactive here. A single tap cycles the state
    // (empty → X → dot → empty) via handleCellClick on release; a drag paints or
    // erases X's in bulk. The dot is single-tap only — never drag-painted.
    if (content !== null && content !== "X" && content !== "dot") return;
    e.preventDefault();
    try { (e.target as Element).setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    const preventScroll = (te: TouchEvent) => te.preventDefault();
    document.addEventListener("touchmove", preventScroll, { passive: false });
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    const paintedSet = new Set<string>();
    const eraseMode = content === "X";
    xPaintingRef.current = { active: true, placedCells: [] };

    const paintCell = (r: number, c: number) => {
      const key = `${r},${c}`;
      if (paintedSet.has(key)) return;
      if (isPinned(r, c)) return;
      paintedSet.add(key);
      if (eraseMode) {
        setGrid((prev) => {
          if (prev[r][c] !== "X") return prev;
          const ng = prev.map((rr) => [...rr]);
          ng[r][c] = null;
          xPaintingRef.current.placedCells.push({ row: r, col: c, prev: "X" });
          return ng;
        });
      } else {
        setGrid((prev) => {
          if (prev[r][c] !== null) return prev;
          const ng = prev.map((rr) => [...rr]);
          ng[r][c] = "X";
          xPaintingRef.current.placedCells.push({ row: r, col: c, prev: null });
          return ng;
        });
      }
    };

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - dragStartRef.current.x;
      const dy = ev.clientY - dragStartRef.current.y;
      if (!dragStartRef.current.moved && Math.sqrt(dx * dx + dy * dy) > 5) {
        dragStartRef.current.moved = true;
        // Promote to a drag-paint: stamp the origin cell now. (A pure tap is
        // handled as a state-cycle on release instead.)
        paintCell(row, col);
      }
      if (dragStartRef.current.moved) {
        const c = getCellFromPointer(ev.clientX, ev.clientY);
        if (c) paintCell(c[0], c[1]);
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("touchmove", preventScroll);
      const placed = xPaintingRef.current.placedCells;
      if (placed.length > 0) {
        setActionHistory((h) => [...h, ...placed.map((p) => ({
          type: eraseMode ? "remove-x" as const : "place-x" as const,
          row: p.row,
          col: p.col,
          previousContent: p.prev,
        }))]);
      } else if (!dragStartRef.current.moved) {
        handleCellClick(row, col);
      }
      xPaintingRef.current = { active: false, placedCells: [] };
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleUndo = () => {
    if (actionHistory.length === 0 || gameWon || revealed) return;
    const last = actionHistory[actionHistory.length - 1];
    const newGrid = grid.map((r) => [...r]);
    newGrid[last.row][last.col] = last.previousContent;
    setGrid(newGrid);
    setActionHistory((h) => h.slice(0, -1));
    setSelectedSuspect(null);
  };

  // Reveal the full solution from `sol` (including the pinned starter). Fills
  // the board, keeps the skull where no suspect sits, and LOCKS input. Does
  // NOT set gameWon — a revealed level is not a solved one.
  const handleReveal = () => {
    if (generating || gameWon || revealed) return;
    const g: CellContent[][] = Array.from({ length: N }, () => Array<CellContent>(N).fill(null));
    for (let si = 0; si < N; si++) {
      const [r, c] = level.sol[si];
      g[r][c] = si;
    }
    if (crime && g[crime[0]][crime[1]] === null) g[crime[0]][crime[1]] = "skull";
    setGrid(g);
    setSelectedSuspect(null);
    setActionHistory([]);
    setRevealed(true);
  };

  // Any board change invalidates the current hint (it is computed from the live
  // board), so drop it. This also resets the escalation so a fresh press starts
  // from level 1 for whatever the new "next step" is.
  useEffect(() => {
    setHintData(null);
    hintSigRef.current = "";
    hintLevelRef.current = 0;
  }, [grid]);

  // Compose the escalating hint text/highlights from an engine result. Level 1
  // names the clue/constraint; level 2 adds the region/line; level 3 adds the
  // exact cell (striped). Inconsistency is reported, never worked around.
  const composeHint = (res: HintResult, lvl: number): { text: string; cells: Set<string>; pendingCells: Set<string> } => {
    const key = (r: number, c: number) => `${r},${c}`;
    const setOf = (arr: Array<[number, number]>) => new Set(arr.map(([r, c]) => key(r, c)));
    const rowLabel = (r: number) => `row ${r + 1}`;
    const colLabel = (c: number) => `column ${c + 1}`;
    const nameOf = (si: number) => suspects[si]?.name ?? "A suspect";

    if (res.kind === "solved") return { text: "Hint: Everything that can be placed is already placed.", cells: new Set(), pendingCells: new Set() };
    if (res.kind === "none") return { text: "Hint: No further step can be deduced from the board as it stands.", cells: new Set(), pendingCells: new Set() };

    if (res.kind === "inconsistent") {
      const cellSet = new Set([key(res.cell[0], res.cell[1])]);
      if (res.reason === "wrong-suspect") {
        const who = res.suspectIdx !== null ? nameOf(res.suspectIdx) : "A suspect";
        const base = `Hint: The board is inconsistent — <b>${who}</b> is in a spot that breaks a rule or their clue, so nothing can be deduced from here.`;
        if (lvl <= 1) return { text: base, cells: new Set(), pendingCells: new Set() };
        return { text: `${base} Tap them to pick them back up.`, cells: cellSet, pendingCells: new Set() };
      }
      if (res.reason === "dot-not-occupied") {
        const base = "Hint: The board is inconsistent — one of your occupied dots is on a cell nobody can stand on, so nothing can be deduced from here.";
        if (lvl <= 1) return { text: base, cells: new Set(), pendingCells: new Set() };
        return { text: `${base} Tap it to clear it.`, cells: cellSet, pendingCells: new Set() };
      }
      const base = "Hint: The board is inconsistent — one of your X marks is on a cell a suspect must occupy, so nothing can be deduced from here.";
      if (lvl <= 1) return { text: base, cells: new Set(), pendingCells: new Set() };
      return { text: `${base} Remove that X.`, cells: cellSet, pendingCells: cellSet };
    }

    if (res.kind === "eliminate") {
      const unit = setOf(res.unitCells);
      const targets = setOf(res.targetCells);
      let l1: string, l2: string;
      if (res.rule === "room") {
        const room = level.rooms[map[res.sourceCell![0]][res.sourceCell![1]]].name;
        l1 = "Only one suspect per room."; l2 = `Look at the <b>${room}</b>.`;
      } else if (res.rule === "row") {
        l1 = "No two suspects share a row."; l2 = `Look at <b>${rowLabel(res.sourceCell![0])}</b>.`;
      } else if (res.rule === "col") {
        l1 = "No two suspects share a column."; l2 = `Look at <b>${colLabel(res.sourceCell![1])}</b>.`;
      } else if (res.rule === "adjacency") {
        l1 = "Suspects can't stand next to each other."; l2 = "Look at the cells touching the one you placed.";
      } else {
        l1 = "No suspect's clue allows one of the open cells."; l2 = "Look for the cell no remaining suspect can enter.";
      }
      if (lvl <= 1) return { text: `Hint: ${l1}`, cells: new Set(), pendingCells: new Set() };
      if (lvl === 2) return { text: `Hint: ${l1} ${l2}`, cells: unit, pendingCells: new Set() };
      return { text: `Hint: ${l1} ${l2} Eliminate the striped cells.`, cells: new Set([...unit, ...targets]), pendingCells: targets };
    }

    // place
    const unit = setOf(res.unitCells);
    const target = new Set([key(res.targetCell[0], res.targetCell[1])]);
    let l1: string, l2: string, l3: string;
    if (res.rule === "occupant" && res.suspectIdx !== null) {
      // A dot the player already placed, now pinned to one identity.
      const clueHtml = level.clues[res.suspectIdx].text;
      l1 = `<b>${nameOf(res.suspectIdx)}</b> — ${clueHtml}`;
      l2 = "That marked cell can only be them.";
      l3 = "Place them on the striped cell.";
    } else if (res.rule === "clue-single" && res.suspectIdx !== null) {
      const clueHtml = level.clues[res.suspectIdx].text;
      l1 = `<b>${nameOf(res.suspectIdx)}</b> — ${clueHtml}`;
      l2 = "Only one spot still fits that clue.";
      l3 = "Place them on the striped cell.";
    } else {
      const unitName = res.rule === "unit-room"
        ? `the ${level.rooms[map[res.targetCell[0]][res.targetCell[1]]].name}`
        : res.rule === "unit-row" ? rowLabel(res.targetCell[0]) : colLabel(res.targetCell[1]);
      const who = res.suspectIdx !== null ? `<b>${nameOf(res.suspectIdx)}</b>` : "A suspect";
      l1 = `${who} must go in ${unitName} — it has only one spot left.`;
      l2 = `Look at ${unitName}.`;
      l3 = "Place them on the striped cell.";
    }
    if (lvl <= 1) return { text: `Hint: ${l1}`, cells: new Set(), pendingCells: new Set() };
    if (lvl === 2) return { text: `Hint: ${l1} ${l2}`, cells: unit, pendingCells: new Set() };
    return { text: `Hint: ${l1} ${l2} ${l3}`, cells: new Set([...unit, ...target]), pendingCells: target };
  };

  // Reasoned lookahead: escalation ladder is (1) the conclusion, (2) why —
  // unpacking the hidden premise, (3) the cell. Never front-load the chain.
  const composeReasoned = (
    res: Extract<HintResult, { kind: "reasoned" }>,
    lvl: number,
  ): { text: string; cells: Set<string>; pendingCells: Set<string> } => {
    const key = (r: number, c: number) => `${r},${c}`;
    const setOf = (arr: Array<[number, number]>) => new Set(arr.map(([r, c]) => key(r, c)));
    const nameOf = (si: number) => suspects[si]?.name ?? "A suspect";
    const premiseName = res.premiseRule === "unit-room"
      ? `the ${level.rooms[map[res.premiseCell[0]][res.premiseCell[1]]].name}`
      : res.premiseRule === "unit-row" ? `row ${res.premiseCell[0] + 1}` : `column ${res.premiseCell[1] + 1}`;
    const why = `because ${premiseName} must hold someone`;

    if (res.outcome.kind === "place") {
      const who = nameOf(res.outcome.suspectIdx);
      const l1 = `<b>${who}</b> has only one legal cell left.`;
      const l2 = `${l1} That follows ${why}.`;
      if (lvl <= 1) return { text: `Hint: ${l1}`, cells: new Set(), pendingCells: new Set() };
      if (lvl === 2) return { text: `Hint: ${l2}`, cells: setOf(res.premiseUnit), pendingCells: new Set() };
      const target = new Set([key(res.outcome.targetCell[0], res.outcome.targetCell[1])]);
      return {
        text: `Hint: ${l2} Place <b>${who}</b> on the striped cell.`,
        cells: new Set([...setOf(res.premiseUnit), ...target]),
        pendingCells: target,
      };
    }
    // eliminate conclusion
    const l1 = "Some cells can be ruled out by looking one step ahead.";
    const l2 = `${l1} It follows ${why}.`;
    if (lvl <= 1) return { text: `Hint: ${l1}`, cells: new Set(), pendingCells: new Set() };
    if (lvl === 2) return { text: `Hint: ${l2}`, cells: setOf(res.premiseUnit), pendingCells: new Set() };
    const targets = setOf(res.outcome.targetCells);
    return {
      text: `Hint: ${l2} Mark the striped cells with X.`,
      cells: new Set([...setOf(res.premiseUnit), ...targets]),
      pendingCells: targets,
    };
  };

  const handleHint = () => {
    if (gameWon || revealed || generating) return;
    if (hintData) { setHintData(null); hintSigRef.current = ""; hintLevelRef.current = 0; return; }
    // The engine READS dots as "occupied, identity unknown" (the intermediate
    // state occupant resolution needs), so pass the live board straight through.
    const res = nextHintFromBoard(level, grid);
    // Signature identifies the specific step, so repeat presses on the SAME
    // step escalate rather than restart.
    const sig = JSON.stringify(
      res.kind === "eliminate" ? ["e", res.rule, res.targetCells]
      : res.kind === "place" ? ["p", res.rule, res.targetCell, res.suspectIdx]
      : res.kind === "reasoned" ? ["r", res.premiseCell, res.outcome.kind, res.outcome.kind === "place" ? res.outcome.suspectIdx : res.outcome.targetCells]
      : res.kind === "inconsistent" ? ["i", res.reason, res.cell]
      : [res.kind],
    );
    if (sig === hintSigRef.current) hintLevelRef.current = Math.min(3, hintLevelRef.current + 1);
    else { hintSigRef.current = sig; hintLevelRef.current = 1; }
    setHintData(res.kind === "reasoned" ? composeReasoned(res, hintLevelRef.current) : composeHint(res, hintLevelRef.current));
  };

  // ── Responsive sizing (ported; N-aware denominators) ──────────────────
  useLayoutEffect(() => {
    const update = () => {
      if (!outerRef.current) return;
      const vh = window.innerHeight;
      const availableW = Math.min(outerRef.current.clientWidth - 32, 500);
      // Measure the actual chrome (control bar) so the board always fits,
      // however tall the bar wraps on a narrow phone. Added constants cover the
      // fixed-height header (44) and the below-board bits (undo + spacers).
      const controlsH = chromeRef.current?.offsetHeight ?? 60;
      const fixedH = 44 + controlsH + 56;
      const availH = vh - fixedH;
      const companionRatio = 116 / REFERENCE_GRID_WIDTH;
      const rulesIdealRatio = 174 / REFERENCE_GRID_WIDTH;
      const rulesMinRatio = 97 / REFERENCE_GRID_WIDTH;
      const maxGrid = Math.min(availableW, 500);
      const phase1Grid = availH / (1 + companionRatio + rulesIdealRatio);
      const phase2Grid = availH / (1 + companionRatio + rulesMinRatio);
      let finalSize: number;
      if (phase1Grid >= 250) {
        finalSize = Math.min(phase1Grid, maxGrid);
      } else {
        finalSize = Math.min(phase2Grid, maxGrid);
        finalSize = Math.max(180, finalSize);
      }
      setGridSizePx(finalSize);
      setLayoutReady(true);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Derived render values ─────────────────────────────────────────────
  const gridBorderRadius = 8 * cellScale;
  const borderW = Math.max(2, 3 * cellScale);
  // Door openings: gap length derives from the SAME constant as the door
  // graphic (DOOR_GAP_FRACTION) so wall gap and pill can never drift. Each
  // side of a gapped edge is drawn as two short segments with a centred gap.
  // The gap is widened by a clearance on EACH side (>=2px) so the wall pulls
  // back clear of the pill instead of touching it.
  const doorGapSet = doorSuppressedEdgeSet(level.doors);
  const doorGapClearance = Math.max(2, 2 * cellScale);
  const wallGapLen = DOOR_GAP_FRACTION * cellSize + 2 * doorGapClearance;
  const wallSegLen = (cellSize - wallGapLen) / 2 + borderW / 2;
  const trayGap = 12 * cellScale;
  const btnHeight = Math.max(28, 36 * chromeScale);
  const btnFontSize = Math.max(12, 15 * chromeScale);
  const btnGap = Math.max(4, 8 * chromeScale);
  const ruleItemH = Math.max(19, 19 * chromeScale);
  const ruleGap = 12 * chromeScale;
  const rulesPadTop = 16 * chromeScale;
  const rulesMinH = rulesPadTop + ruleItemH * 3 + ruleGap * 2;
  const labelFont = Math.max(12, 15 * chromeScale);

  const placedSuspects = new Set<number>();
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const cell = grid[r][c];
      if (typeof cell === "number") placedSuspects.add(cell);
    }
  }

  const placementErrors = getPlacementErrors(grid, N, map);
  const allCrossHatchCells = placementErrors.crossHatchCells;
  const activeSuspect = dragState?.idx ?? selectedSuspect;

  const getCellRounding = (row: number, col: number): string => {
    const r = gridBorderRadius;
    return `${row === 0 && col === 0 ? r : 0}px ${row === 0 && col === N - 1 ? r : 0}px ${row === N - 1 && col === N - 1 ? r : 0}px ${row === N - 1 && col === 0 ? r : 0}px`;
  };

  const labels = Array.from({ length: N }, (_, i) => String(i + 1));
  const trayTileSize = 64 * cellScale;

  return (
    <div
      ref={outerRef}
      className="flex flex-col h-[100dvh] w-full overflow-hidden bg-[#fcfcfc]"
      style={{ visibility: layoutReady ? "visible" : "hidden", zIndex: 10000, position: "fixed", inset: 0 }}
    >
      <style>{`.clue-scroll::-webkit-scrollbar { display: none; }`}</style>

      <GeneratorHeader onBack={onBack} showBack={false} />

      {/* Real control bar (Step 6). Chrome (header + bar) is measured so the
          board fits at any size; header is fixed-height so we add it here. */}
      <div ref={chromeRef} className="shrink-0 w-full">
        <div className="w-full flex justify-center">
          <GeneratorControls
            size={size}
            onSize={onSize}
            onRegenerate={onRegenerate}
            onReveal={handleReveal}
            onBack={onBack}
            generating={generating}
            failed={failed}
            genAttempt={genAttempt}
            gameWon={gameWon}
            revealed={revealed}
          />
        </div>
      </div>

      {/* Game content */}
      <div className="flex-1 flex flex-col items-center min-h-0 overflow-hidden relative z-20">
        <div className="flex flex-col items-center w-full max-w-[500px] min-h-0 flex-1 pt-[8px] pb-[16px]">
          {/* Grid with labels */}
          <div className="flex items-start justify-center w-full shrink-0 p-[0px]">
            <div className="relative flex">
              {/* Row labels */}
              <div className="flex flex-col pr-[8px] relative" style={{ height: gridSize, marginTop: `calc(${labelFont}px + 20px)` }}>
                {labels.map((label) => (
                  <div key={label} className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#191919]" style={{ fontSize: labelFont, height: cellSize, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {label}
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                {/* Column labels */}
                <div className="flex justify-around items-center pb-[12px] relative" style={{ width: gridSize }}>
                  {labels.map((label) => (
                    <div key={label} className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#191919]" style={{ fontSize: labelFont, width: cellSize, textAlign: "center" }}>
                      {label}
                    </div>
                  ))}
                </div>

                {/* Board shadow wrapper */}
                <div className="relative" style={{ width: gridSize, height: gridSize, borderRadius: gridBorderRadius, boxShadow: `0px ${Math.max(2, 4 * cellScale)}px 0px 0px #191919` }}>
                  <div ref={gridContainerRef} className="relative size-full" style={{ touchAction: "none" }}>
                    {Array.from({ length: N }, (_, row) =>
                      Array.from({ length: N }, (_, col) => {
                        const roomIdx = map[row][col];
                        const bgColor = level.rooms[roomIdx].fill + "20";
                        const content = grid[row][col];
                        const edges = getRoomBorderEdges(row, col, map);
                        const rounding = getCellRounding(row, col);
                        const cellKey = `${row},${col}`;
                        const gapTop = edges.top && doorGapSet.has(`${cellKey},top`);
                        const gapBottom = edges.bottom && doorGapSet.has(`${cellKey},bottom`);
                        const gapLeft = edges.left && doorGapSet.has(`${cellKey},left`);
                        const gapRight = edges.right && doorGapSet.has(`${cellKey},right`);
                        const hasRedOutline = placementErrors.redOutlineCells.has(cellKey);
                        const hasCrossHatch = allCrossHatchCells.has(cellKey);
                        const isStarterCell = row === starterRow && col === starterCol;

                        return (
                          <div
                            key={`${row}-${col}`}
                            className="absolute flex items-center justify-center cursor-pointer overflow-visible"
                            style={{ left: col * cellSize, top: row * cellSize, width: cellSize, height: cellSize, backgroundColor: bgColor, borderRadius: rounding, touchAction: "none" }}
                            onPointerDown={(e) => {
                              const ct = grid[row][col];
                              if (typeof ct === "number" && !isPinned(row, col)) {
                                handlePointerDown(e, ct, [row, col]);
                              } else {
                                handleGridPointerDown(e, row, col);
                              }
                            }}
                          >
                            <div className="absolute pointer-events-none" style={{ inset: -0.5, border: "1px solid #666", borderRadius: rounding }} />
                            {hasRedOutline && !gameWon && (
                              <div className="absolute pointer-events-none" style={{ inset: -1, border: `${Math.max(1.5, 2 * cellScale)}px solid #FF0000`, borderRadius: rounding, zIndex: 6 }} />
                            )}
                            <div
                              className="absolute pointer-events-none"
                              style={{
                                inset: `${edges.top && !gapTop ? -borderW / 2 : 0}px ${edges.right && !gapRight ? -borderW / 2 : 0}px ${edges.bottom && !gapBottom ? -borderW / 2 : 0}px ${edges.left && !gapLeft ? -borderW / 2 : 0}px`,
                                borderTop: edges.top && !gapTop ? `${borderW}px solid #191919` : "none",
                                borderBottom: edges.bottom && !gapBottom ? `${borderW}px solid #191919` : "none",
                                borderLeft: edges.left && !gapLeft ? `${borderW}px solid #191919` : "none",
                                borderRight: edges.right && !gapRight ? `${borderW}px solid #191919` : "none",
                                borderRadius: rounding,
                                zIndex: 5,
                              }}
                            />
                            {/* Door openings: two short border segments with a centred gap
                                (gap === door pill length). Doors only ever sit on interior
                                walls, so these never coincide with a rounded board corner. */}
                            {gapTop && (
                              <>
                                <div className="absolute pointer-events-none" style={{ top: -borderW / 2, left: -borderW / 2, width: wallSegLen, height: borderW, backgroundColor: "#191919", zIndex: 5 }} />
                                <div className="absolute pointer-events-none" style={{ top: -borderW / 2, right: -borderW / 2, width: wallSegLen, height: borderW, backgroundColor: "#191919", zIndex: 5 }} />
                              </>
                            )}
                            {gapBottom && (
                              <>
                                <div className="absolute pointer-events-none" style={{ top: cellSize - borderW / 2, left: -borderW / 2, width: wallSegLen, height: borderW, backgroundColor: "#191919", zIndex: 5 }} />
                                <div className="absolute pointer-events-none" style={{ top: cellSize - borderW / 2, right: -borderW / 2, width: wallSegLen, height: borderW, backgroundColor: "#191919", zIndex: 5 }} />
                              </>
                            )}
                            {gapLeft && (
                              <>
                                <div className="absolute pointer-events-none" style={{ left: -borderW / 2, top: -borderW / 2, width: borderW, height: wallSegLen, backgroundColor: "#191919", zIndex: 5 }} />
                                <div className="absolute pointer-events-none" style={{ left: -borderW / 2, bottom: -borderW / 2, width: borderW, height: wallSegLen, backgroundColor: "#191919", zIndex: 5 }} />
                              </>
                            )}
                            {gapRight && (
                              <>
                                <div className="absolute pointer-events-none" style={{ left: cellSize - borderW / 2, top: -borderW / 2, width: borderW, height: wallSegLen, backgroundColor: "#191919", zIndex: 5 }} />
                                <div className="absolute pointer-events-none" style={{ left: cellSize - borderW / 2, bottom: -borderW / 2, width: borderW, height: wallSegLen, backgroundColor: "#191919", zIndex: 5 }} />
                              </>
                            )}
                            <div className="relative flex items-center justify-center" style={{ zIndex: (typeof content === "number" || content === "skull") ? 8 : 1 }}>
                              {typeof content === "number" && (
                                <SuspectTile
                                  name={suspects[content].name}
                                  color={suspects[content].color}
                                  spritePos={suspects[content].sprite}
                                  showName={showNameOnBoard}
                                  showEveBadge={false}
                                  inGrid
                                  gridScale={cellScale}
                                  isMurderer={gameWon && content === level.murdererIdx}
                                />
                              )}
                              {content === "skull" && <SkullIcon scale={cellScale} />}
                              {content === "X" && <XMark scale={cellScale} />}
                              {content === "dot" && <DotMark scale={cellScale} />}
                            </div>
                            {hasCrossHatch && !gameWon && <RedCrossHatch />}
                            {hintData && !gameWon && hintData.pendingCells.has(cellKey) && (grid[row][col] === null || grid[row][col] === "dot") && <HintStripes />}
                            {hintData && !gameWon && hintData.cells.size > 0 && !hintData.cells.has(cellKey) && (
                              <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 4 }} />
                            )}
                            {activeSuspect !== null && !gameWon && isStarterCell && (
                              <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(0,0,0,0.15)", zIndex: 4 }} />
                            )}
                          </div>
                        );
                      }),
                    )}
                    <RoomLabels level={level} cellSize={cellSize} cellScale={cellScale} />
                    <DoorWindowOverlay level={level} cellSize={cellSize} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="h-[16px] shrink-0" />

          {/* Undo + Hint buttons */}
          <div className="w-full px-[16px] shrink-0">
            <div className="flex w-full" style={{ gap: btnGap }}>
              <button
                className="flex-1 rounded-[50px] relative bg-[#01394b] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                style={{ opacity: actionHistory.length === 0 || gameWon || revealed ? 0.3 : 1, height: btnHeight, gap: btnGap }}
                onClick={handleUndo}
                disabled={actionHistory.length === 0 || gameWon || revealed}
              >
                <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[50px] shadow-[0px_2px_0px_0px_#678893]" />
                <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#fcfcfc]" style={{ fontSize: btnFontSize }}>Undo</span>
              </button>
              <button
                className="flex-1 rounded-[50px] relative bg-[#01394b] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                style={{ opacity: gameWon || revealed || generating ? 0.3 : 1, height: btnHeight, gap: btnGap }}
                onClick={handleHint}
                disabled={gameWon || revealed || generating}
              >
                <div aria-hidden="true" className="absolute border border-[#678893] border-solid inset-0 pointer-events-none rounded-[50px] shadow-[0px_2px_0px_0px_#678893]" />
                <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#fcfcfc]" style={{ fontSize: btnFontSize }}>{hintData ? "Hide Hint" : "Hint"}</span>
              </button>
            </div>
          </div>

          {/* Spacer */}
          <div className="h-[16px] shrink-0" />

          {/* Suspect tray */}
          <div ref={trayRef} className="w-full shrink-0 relative" style={{ paddingTop: `${32 * cellScale}px`, touchAction: "none" }}>
            <div className="flex justify-center items-end z-10 relative flex-wrap" style={{ marginTop: `${-24 * cellScale}px`, rowGap: `${8 * cellScale}px` }}>
              {suspects.map((s, idx) => {
                if (idx === level.starterIdx) return null; // starter pinned on board
                const isPlaced = placedSuspects.has(idx);
                const isDragging = dragState?.idx === idx;
                return (
                  <div
                    key={s.name}
                    style={{
                      width: isPlaced || isDragging ? 0 : trayTileSize,
                      height: trayTileSize,
                      opacity: isPlaced || isDragging ? 0 : 1,
                      marginLeft: isPlaced || isDragging ? 0 : trayGap / 2,
                      marginRight: isPlaced || isDragging ? 0 : trayGap / 2,
                      transform: isPlaced || isDragging ? "scale(0.5)" : "scale(1)",
                      transition: isDragging ? "none" : "width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease",
                      overflow: isPlaced || isDragging ? "hidden" : "visible",
                      flexShrink: 0,
                      touchAction: "none",
                    }}
                    onPointerDown={(e) => { if (!isPlaced) handlePointerDown(e, idx, null); }}
                  >
                    <div style={{ width: trayTileSize, height: trayTileSize }}>
                      <SuspectTile
                        name={s.name}
                        color={s.color}
                        spritePos={s.sprite}
                        showEveBadge={false}
                        selected={selectedSuspect === idx}
                        gridScale={cellScale}
                        inGrid
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-[#e6ebed] w-full" style={{ height: `${48 * cellScale}px`, marginTop: `${-40 * cellScale}px` }} />
          </div>

          {/* Clue panel — scrolling (see report). */}
          <div
            className="w-full max-w-[500px] flex-1 flex overflow-hidden"
            style={{ gap: `${16 * chromeScale}px`, paddingLeft: `${16 * chromeScale}px`, paddingRight: `${8 * chromeScale}px`, paddingTop: rulesPadTop, minHeight: rulesMinH }}
          >
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto clue-scroll" style={{ scrollbarWidth: "none", gap: ruleGap }}>
              {placementErrors.hasError && !gameWon ? <ErrorBanner scale={chromeScale} /> : null}
              {hintData && !gameWon && <HintBanner text={hintData.text} scale={chromeScale} />}
              {gameWon && (
                <div className="shrink-0 w-full font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#01394b]" style={{ fontSize: `${Math.max(12, 15 * chromeScale)}px` }}>
                  Solved. The murderer was {suspects[level.murdererIdx].name}.
                </div>
              )}
              {level.orderedIdxs.map((si) => {
                if (si === level.starterIdx) return null;
                const s = suspects[si];
                return (
                  <div key={si} className="flex items-center shrink-0 w-full" style={{ gap: `${8 * chromeScale}px`, opacity: gameWon ? 0.4 : 1 }}>
                    <div className="relative shrink-0" style={{ backgroundColor: "#fcfcfc", borderRadius: `${4 * chromeScale}px` }}>
                      <div className="flex items-center overflow-clip" style={{ padding: `${3 * chromeScale}px`, borderRadius: "inherit" }}>
                        <div className="overflow-clip shrink-0 relative" style={{ width: `${13 * chromeScale}px`, height: `${13 * chromeScale}px` }} />
                      </div>
                      <div aria-hidden="true" className="absolute border border-[#666] border-solid inset-0 pointer-events-none" style={{ borderRadius: `${4 * chromeScale}px` }} />
                    </div>
                    <div className="flex-1 min-w-0" style={{ fontSize: `${Math.max(11, 13 * chromeScale)}px` }}>
                      <span className="font-['Inter:Bold',sans-serif] font-bold underline" style={{ color: s.color }}>{s.name}</span>
                      <span className="font-normal">{" "}</span>
                      <ClueText html={level.clues[si].text} className="font-['Inter:Regular',sans-serif] font-normal" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating drag element */}
      {dragState && (
        <div
          ref={(el) => {
            floatingRef.current = el;
            if (el) {
              const { x, y } = dragPosRef.current;
              el.style.transform = `translate(${x - cellTileSize / 2}px, ${y - cellTileSize / 2}px)`;
            }
          }}
          className="fixed top-0 left-0 pointer-events-none"
          style={{ zIndex: 9999, width: cellTileSize, height: cellTileSize, opacity: 0.9 }}
        >
          <SuspectTile
            name={suspects[dragState.idx].name}
            color={suspects[dragState.idx].color}
            spritePos={suspects[dragState.idx].sprite}
            showName={showNameOnBoard}
            showEveBadge={false}
            inGrid
            gridScale={cellScale}
          />
        </div>
      )}

      {/* Regeneration overlay (keeps the old board visible underneath) */}
      {generating && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10001, backgroundColor: "rgba(252,252,252,0.7)" }}>
          <span className="font-['Inter',sans-serif] font-semibold text-[15px] text-[#01394b]">Generating {size}×{size}…</span>
        </div>
      )}
    </div>
  );
}
