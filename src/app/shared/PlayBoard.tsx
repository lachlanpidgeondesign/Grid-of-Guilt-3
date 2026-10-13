// Grid of Guilt — shared interactive board.
//
// Extracted verbatim from GeneratorGameInner so both the Generator and the new
// /play/ levels + tutorial can render the same board. Generator behaviour must
// not change: the drag / tap / paint / undo / reveal / win logic below is the
// same code, moved. New optional props (dimmedCells, hatchedCells, xOnlyCells,
// canPlace, onVeto, allowTray) are inert when omitted — the Generator omits
// them, so its behaviour is identical.
//
// The board OWNS its grid + action history (so the delicate functional-setState
// drag/paint logic is unchanged) and reports every change via onChange, exposes
// undo/reveal through a ref, and fires onWin when the board becomes a correct,
// error-free full placement. The parent owns responsive sizing (passes gridSize
// in px), the clue panel, hint computation and the won/revealed flags.

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import imgSkull from "figma:asset/a3421f4c3e01f93f3d4ecd691c2877bc43bb85f8.png";
import imgRedStripes from "figma:asset/6ef35fa416ded2d3144709b550f95331c3928998.png";
import SuspectTile from "./SuspectTile";
import { getRoomBorderEdges, doorSuppressedEdgeSet, DOOR_GAP_FRACTION } from "./boardGeometry";
import type { GeneratedLevel } from "../generator/puzzleGenerator";
import { suspectsForSize, type GeneratorSuspect } from "../generator/suspects";

// ── Reference constants (shared with the generator chrome) ────────────
// At 5x5 the daily game uses gridScale = gridSize / 358 and a per-cell
// reference of 358/5 = 71.6px. Exported so GeneratorGame's label-clash check
// and chrome scaling stay in lockstep with the board.
export const REFERENCE_GRID_WIDTH = 358;
export const REFERENCE_CELL = REFERENCE_GRID_WIDTH / 5; // 71.6

// A board cell holds a suspect index, an "X" mark, a "dot" (occupied, identity
// unknown), the "skull" crime-scene marker, or null.
export type CellContent = number | "X" | "dot" | "skull" | null;

export interface BoardAction {
  type: "place-suspect" | "place-x" | "remove-x" | "remove-suspect" | "place-dot" | "remove-dot";
  row: number;
  col: number;
  previousContent: CellContent;
}

// ── Constraint checking (generator semantics) ─────────────────────────
export interface PlacementErrors {
  crossHatchCells: Set<string>;
  redOutlineCells: Set<string>;
  hasError: boolean;
}

export function getPlacementErrors(grid: CellContent[][], N: number, map: number[][]): PlacementErrors {
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

// Tutorial "mark these with X" diagonal-stripe overlay. Neutral grey so it
// reads as guidance rather than an error (red) or a hint (teal).
function HatchStripes() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        zIndex: 3,
        backgroundImage: "repeating-linear-gradient(45deg, rgba(25,25,25,0.22) 0, rgba(25,25,25,0.22) 3px, transparent 3px, transparent 7px)",
      }}
    />
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

function DoorWindowOverlay({ level, cellSize }: { level: GeneratedLevel; cellSize: number }) {
  const pillLen = cellSize * DOOR_GAP_FRACTION;
  const pillThick = pillLen * MARKER_ASPECT;

  type Placed = { key: string; cx: number; cy: number; rot: number; kind: "door" | "window" };
  const placed: Placed[] = [];

  for (const d of level.doors) {
    if (d.dir === "down") {
      placed.push({ key: `d-${d.r}-${d.c}-down`, cx: (d.c + 0.5) * cellSize, cy: (d.r + 1) * cellSize, rot: 0, kind: "door" });
    } else {
      placed.push({ key: `d-${d.r}-${d.c}-right`, cx: (d.c + 1) * cellSize, cy: (d.r + 0.5) * cellSize, rot: 90, kind: "door" });
    }
  }
  for (const w of level.windows) {
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

// ── Room labels ───────────────────────────────────────────────────────
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
// Shared by the renderer and the generator's pre-flight clash check so the two
// can't drift.
export function computeRoomLabelLayout(level: GeneratedLevel, cellSize: number, cellScale: number): LabelLayout {
  const map = level.map;
  const N = map.length;

  const pillH = Math.max(13, 22 * cellScale);
  const fontSize = Math.max(7, 11 * cellScale);
  const padX = Math.max(4, 8 * cellScale);
  const borderW = Math.max(1, 2 * cellScale);
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

// ── PlayBoard ─────────────────────────────────────────────────────────
export interface PlayBoardHandle {
  /** Undo the most recent action (no-op when history is empty or locked). */
  undo: () => void;
  /** Fill the board with the full solution and lock it (does NOT count as a win). */
  reveal: () => void;
  /** Current board grid (live). */
  getGrid: () => CellContent[][];
  /** Current action history length (for an undo-disabled check). */
  getHistoryLength: () => number;
}

export interface PlayBoardProps {
  level: GeneratedLevel;
  /** Square board size in px (parent owns responsive sizing). */
  gridSize: number;
  /** Suspect roster (names, colours, sprites). Defaults to suspectsForSize(N);
   *  the tutorial supplies its own cast. */
  suspects?: GeneratorSuspect[];
  /** Show the suspect name under the avatar on the board (false for large N). */
  showNameOnBoard: boolean;
  /** Starting grid; defaults to starter + body pre-placed. */
  initialGrid?: CellContent[][];
  /** Starting undo history; defaults to empty. */
  initialHistory?: BoardAction[];
  /** No input accepted (won / revealed / paused). */
  locked?: boolean;
  /** Won: draw the murderer outline, hide rule-error marks. */
  won?: boolean;
  /** Show and enable the suspect tray (default true). */
  allowTray?: boolean;
  /** Render the tray into this element (desktop right column) instead of inline.
   *  Omit for the default inline-below-board layout. */
  trayPortal?: HTMLElement | null;
  /** Lay the tray out as a fixed grid with this many columns, keeping an empty
   *  slot for each placed suspect (the tray never shrinks). Omit for the default
   *  centred flow tray that collapses placed tiles. */
  trayColumns?: number;
  /** Draw the pale shelf bar under the flow tray (default true). Ignored when
   *  trayColumns is set. */
  trayShelf?: boolean;
  /** Restrict the tray to these suspect indices (others are hidden). The
   *  tutorial uses this to show one suspect at a time. Omit for all suspects. */
  traySuspectIdxs?: number[];
  /** Slot rendered between the board and the tray (e.g. the generator buttons). */
  betweenBoardAndTray?: ReactNode;
  // ── Hint overlays (generator + play) ──
  /** Cells to keep lit; every other cell is dimmed (empty set = no dimming). */
  hintCells?: Set<string>;
  /** Cells to mark with the striped "target" overlay. */
  hintPendingCells?: Set<string>;
  // ── Tutorial overlays (inert when omitted) ──
  /** Cells rendered dark and non-interactive. */
  dimmedCells?: Set<string>;
  /** Cells with the tutorial diagonal-stripe overlay. */
  hatchedCells?: Set<string>;
  /** When set, X marks may only be placed on these cells; dots are disabled. */
  xOnlyCells?: Set<string> | null;
  /** Veto a drop; return true to allow, false/string to reject (string = message). */
  canPlace?: (suspectIdx: number, row: number, col: number) => boolean | string;
  /** Called whenever the grid or history changes. */
  onChange?: (grid: CellContent[][], history: BoardAction[]) => void;
  /** Called once the board becomes a correct, error-free full placement. */
  onWin?: () => void;
  /** Called when a drop is vetoed (message may be null); cell is the target. */
  onVeto?: (message: string | null, cell: [number, number]) => void;
}

function PlayBoardInner(props: PlayBoardProps, ref: React.Ref<PlayBoardHandle>) {
  const {
    level, gridSize, showNameOnBoard,
    initialGrid, initialHistory,
    locked = false, won = false, allowTray = true,
    trayPortal, trayColumns, trayShelf = true, traySuspectIdxs,
    betweenBoardAndTray,
    hintCells, hintPendingCells,
    dimmedCells, hatchedCells, xOnlyCells,
    canPlace, onChange, onWin, onVeto,
  } = props;

  const N = level.N;
  const map = level.map;
  const suspects: GeneratorSuspect[] = props.suspects ?? suspectsForSize(N);

  const [starterRow, starterCol] = level.sol[level.starterIdx];
  const crime = level.crimeSceneCell;

  const buildDefaultGrid = useCallback((): CellContent[][] => {
    const g: CellContent[][] = Array.from({ length: N }, () => Array<CellContent>(N).fill(null));
    g[starterRow][starterCol] = level.starterIdx;
    if (crime) g[crime[0]][crime[1]] = "skull";
    return g;
  }, [N, starterRow, starterCol, crime, level.starterIdx]);

  const [grid, setGrid] = useState<CellContent[][]>(() =>
    initialGrid ? initialGrid.map((r) => [...r]) : buildDefaultGrid(),
  );
  const [selectedSuspect, setSelectedSuspect] = useState<number | null>(null);
  const [actionHistory, setActionHistory] = useState<BoardAction[]>(() =>
    initialHistory ? [...initialHistory] : [],
  );

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
  const historyRef = useRef(actionHistory);
  historyRef.current = actionHistory;

  // Latest-callback / flag refs so the imperative handle and effects never go
  // stale and never need to be rebuilt.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  const revealedRef = useRef(false);
  const wonFiredRef = useRef(false);

  const isPinned = (row: number, col: number): boolean => {
    if (row === starterRow && col === starterCol) return true;
    if (crime && row === crime[0] && col === crime[1]) return true;
    return false;
  };
  const isDimmed = (row: number, col: number): boolean => dimmedCells?.has(`${row},${col}`) ?? false;

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

  // Report grid / history changes to the parent.
  useEffect(() => {
    onChangeRef.current?.(grid, actionHistory);
  }, [grid, actionHistory]);

  // Fire onWin exactly once, when the board first becomes a correct full
  // placement — but never for a revealed board (reveal is not a solve).
  useEffect(() => {
    if (revealedRef.current || wonFiredRef.current) return;
    if (checkWin(grid)) {
      wonFiredRef.current = true;
      onWinRef.current?.();
    }
  }, [grid, checkWin]);

  // ── Scales ───────────────────────────────────────────────────────────
  const cellSize = gridSize / N;
  const cellScale = cellSize / REFERENCE_CELL;

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
    if (locked) return;
    const current = grid[row][col];
    if (isPinned(row, col)) return;
    if (isDimmed(row, col)) return;

    if (selectedSuspect !== null) {
      if (typeof current === "number") { setSelectedSuspect(null); return; }
      const verdict = canPlace ? canPlace(selectedSuspect, row, col) : true;
      if (verdict !== true) {
        onVeto?.(typeof verdict === "string" ? verdict : null, [row, col]);
        setSelectedSuspect(null);
        return;
      }
      const newGrid = grid.map((r) => [...r]);
      newGrid[row][col] = selectedSuspect;
      setGrid(newGrid);
      setActionHistory((h) => [...h, { type: "place-suspect", row, col, previousContent: current }]);
      setSelectedSuspect(null);
    } else if (xOnlyCells) {
      // Tutorial X-only mode: toggle an X on allowed cells only; no dots.
      if (!xOnlyCells.has(`${row},${col}`)) return;
      if (current === null) {
        const newGrid = grid.map((r) => [...r]);
        newGrid[row][col] = "X";
        setGrid(newGrid);
        setActionHistory((h) => [...h, { type: "place-x", row, col, previousContent: null }]);
      } else if (current === "X") {
        const newGrid = grid.map((r) => [...r]);
        newGrid[row][col] = null;
        setGrid(newGrid);
        setActionHistory((h) => [...h, { type: "remove-x", row, col, previousContent: "X" }]);
      }
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
    if (locked) return;
    setSelectedSuspect((prev) => (prev === idx ? null : idx));
  };

  // ── Drag (tray or grid) ──────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent, idx: number, fromGrid: [number, number] | null) => {
    if (locked) return;
    if (fromGrid && isPinned(fromGrid[0], fromGrid[1])) return;
    if (fromGrid && isDimmed(fromGrid[0], fromGrid[1])) return;
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
          const canDrop = (targetCell === null || targetCell === "X") && !isPinned(row, col) && !isDimmed(row, col);
          const verdict = canDrop && canPlace ? canPlace(idx, row, col) : true;
          if (canDrop && verdict === true) {
            ng[row][col] = idx;
            if (startFromGrid) {
              setActionHistory((h) => [...h,
                { type: "remove-suspect", row: startFromGrid[0], col: startFromGrid[1], previousContent: idx },
                { type: "place-suspect", row, col, previousContent: targetCell },
              ]);
            } else {
              setActionHistory((h) => [...h, { type: "place-suspect", row, col, previousContent: targetCell }]);
            }
          } else {
            if (startFromGrid) ng[startFromGrid[0]][startFromGrid[1]] = idx;
            if (canDrop && verdict !== true) {
              onVeto?.(typeof verdict === "string" ? verdict : null, [row, col]);
            }
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
    if (locked) return;
    if (isDimmed(row, col)) return;
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

    // In X-only (tutorial) mode, paint may only touch allowed cells.
    const paintAllowed = (r: number, c: number) => (xOnlyCells ? xOnlyCells.has(`${r},${c}`) : true);

    const paintCell = (r: number, c: number) => {
      const key = `${r},${c}`;
      if (paintedSet.has(key)) return;
      if (isPinned(r, c)) return;
      if (isDimmed(r, c)) return;
      if (!paintAllowed(r, c)) return;
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

  // ── Imperative handle (undo / reveal) ────────────────────────────────
  useImperativeHandle(ref, (): PlayBoardHandle => ({
    undo: () => {
      const hist = historyRef.current;
      if (hist.length === 0 || lockedRef.current) return;
      const last = hist[hist.length - 1];
      setGrid((prev) => {
        const ng = prev.map((r) => [...r]);
        ng[last.row][last.col] = last.previousContent;
        return ng;
      });
      setActionHistory((h) => h.slice(0, -1));
      setSelectedSuspect(null);
    },
    reveal: () => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      const g: CellContent[][] = Array.from({ length: N }, () => Array<CellContent>(N).fill(null));
      for (let si = 0; si < N; si++) {
        const [r, c] = level.sol[si];
        g[r][c] = si;
      }
      if (crime && g[crime[0]][crime[1]] === null) g[crime[0]][crime[1]] = "skull";
      setGrid(g);
      setSelectedSuspect(null);
      setActionHistory([]);
    },
    getGrid: () => gridRef.current,
    getHistoryLength: () => historyRef.current.length,
  }), [N, level.sol, crime]);

  // ── Derived render values ─────────────────────────────────────────────
  const gridBorderRadius = 8 * cellScale;
  const borderW = Math.max(2, 3 * cellScale);
  const doorGapSet = doorSuppressedEdgeSet(level.doors);
  const doorGapClearance = Math.max(2, 2 * cellScale);
  const wallGapLen = DOOR_GAP_FRACTION * cellSize + 2 * doorGapClearance;
  const wallSegLen = (cellSize - wallGapLen) / 2 + borderW / 2;
  const trayGap = 12 * cellScale;

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
  const labelFont = Math.max(12, 15 * (gridSize / REFERENCE_GRID_WIDTH));
  const hintCellSet = hintCells ?? null;
  const hintPendingSet = hintPendingCells ?? null;
  const traySet = traySuspectIdxs ? new Set(traySuspectIdxs) : null;
  const inTray = (idx: number) => idx !== level.starterIdx && (!traySet || traySet.has(idx));

  const trayTile = (s: (typeof suspects)[number], idx: number) => (
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
  );

  // Fixed-grid tray (used by /play/): every suspect keeps a slot, so the area
  // never shrinks as suspects are placed. Placed/dragging tiles fade out in place.
  const gridTrayNode = allowTray && trayColumns != null ? (
    <div ref={trayRef} className="w-full shrink-0 relative" style={{ paddingTop: `${16 * cellScale}px`, touchAction: "none" }}>
      {trayShelf && (
        <div className="bg-[#e6ebed] absolute left-0 right-0 z-0" style={{ bottom: `${-8 * cellScale}px`, height: `${48 * cellScale}px` }} />
      )}
      <div className="relative z-10 flex justify-center">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${trayColumns}, ${trayTileSize}px)`,
            gap: `${trayGap}px`,
            justifyContent: "center",
          }}
        >
          {suspects.map((s, idx) => {
            if (!inTray(idx)) return null; // starter pinned / filtered out
            const isPlaced = placedSuspects.has(idx);
            const isDragging = dragState?.idx === idx;
            const hidden = isPlaced || isDragging;
            return (
              <div
                key={s.name}
                style={{
                  width: trayTileSize,
                  height: trayTileSize,
                  opacity: hidden ? 0 : 1,
                  transform: hidden ? "scale(0.5)" : "scale(1)",
                  transition: isDragging ? "none" : "opacity 0.25s ease, transform 0.3s ease",
                  pointerEvents: hidden ? "none" : "auto",
                  touchAction: "none",
                }}
                onPointerDown={(e) => { if (!isPlaced) handlePointerDown(e, idx, null); }}
              >
                {trayTile(s, idx)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  const flowTrayNode = allowTray && trayColumns == null ? (
    <div ref={trayRef} className="w-full shrink-0 relative" style={{ paddingTop: `${32 * cellScale}px`, touchAction: "none" }}>
      <div className="flex justify-center items-end z-10 relative flex-wrap" style={{ marginTop: `${-24 * cellScale}px`, rowGap: `${8 * cellScale}px` }}>
        {suspects.map((s, idx) => {
          if (!inTray(idx)) return null; // starter pinned / filtered out
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
              {trayTile(s, idx)}
            </div>
          );
        })}
      </div>
      {trayShelf && (
        <div className="bg-[#e6ebed] w-full" style={{ height: `${48 * cellScale}px`, marginTop: `${-40 * cellScale}px` }} />
      )}
    </div>
  ) : null;

  const trayNode = gridTrayNode ?? flowTrayNode;

  return (
    <>
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
                    const cellDimmed = isDimmed(row, col);
                    const cellHatched = hatchedCells?.has(cellKey) ?? false;

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
                        {hasRedOutline && !won && (
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
                              isMurderer={won && content === level.murdererIdx}
                            />
                          )}
                          {content === "skull" && <SkullIcon scale={cellScale} />}
                          {content === "X" && <XMark scale={cellScale} />}
                          {content === "dot" && <DotMark scale={cellScale} />}
                        </div>
                        {hasCrossHatch && !won && <RedCrossHatch />}
                        {cellHatched && <HatchStripes />}
                        {hintPendingSet && !won && hintPendingSet.has(cellKey) && (grid[row][col] === null || grid[row][col] === "dot") && <HintStripes />}
                        {hintCellSet && !won && hintCellSet.size > 0 && !hintCellSet.has(cellKey) && (
                          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 4 }} />
                        )}
                        {cellDimmed && (
                          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 4 }} />
                        )}
                        {activeSuspect !== null && !won && isStarterCell && (
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

      {betweenBoardAndTray}

      {/* Suspect tray (inline by default, or portalled into the desktop
          right-hand column when trayPortal is supplied). */}
      {trayNode && (trayPortal ? createPortal(trayNode, trayPortal) : trayNode)}

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
    </>
  );
}

const PlayBoard = forwardRef<PlayBoardHandle, PlayBoardProps>(PlayBoardInner);
export default PlayBoard;
