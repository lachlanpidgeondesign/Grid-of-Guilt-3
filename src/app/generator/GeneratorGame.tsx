import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import imgKnifePng from "figma:asset/58d165bd57360408c1c72634c155b7d947ea2f28.png";
import { doorSuppressedEdgeSet } from "../shared/boardGeometry";
import PlayBoard, {
  getPlacementErrors,
  computeRoomLabelLayout,
  REFERENCE_GRID_WIDTH,
  REFERENCE_CELL,
  type CellContent,
  type BoardAction,
  type PlayBoardHandle,
} from "../shared/PlayBoard";
import { generateLevelAsync, type GeneratedLevel } from "./puzzleGenerator";
import { nextHintFromBoard, type HintResult } from "./constraintSolver";
import { suspectsForSize, type GeneratorSuspect } from "./suspects";
import ClueText from "./ClueText";

// ── Layout tuning ─────────────────────────────────────────────────────
// Single named threshold: at/above this N the board shows avatar-only tokens
// (no name label); below it, avatar + name exactly like the daily game.
export const AVATAR_ONLY_AT_N = 7;

type GridSize = 5 | 7 | 9;

interface GeneratorGameProps {
  onBackToStart: () => void;
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
  const showNameOnBoard = N < AVATAR_ONLY_AT_N;

  const [starterRow, starterCol] = level.sol[level.starterIdx];
  const crime = level.crimeSceneCell;

  const buildInitialGrid = useCallback((): CellContent[][] => {
    const g: CellContent[][] = Array.from({ length: N }, () => Array<CellContent>(N).fill(null));
    g[starterRow][starterCol] = level.starterIdx;
    if (crime) g[crime[0]][crime[1]] = "skull";
    return g;
  }, [N, starterRow, starterCol, crime, level.starterIdx]);

  // The board (PlayBoard) owns its grid + undo history. The parent keeps a
  // mirror (to feed the hint engine and the error banner) plus the counts and
  // flags it renders chrome from. GeneratorGameInner only ever mounts against
  // one level (the outer keys it by levelId), so these initialise from `level`
  // and never need a reset.
  const boardRef = useRef<PlayBoardHandle>(null);
  const [gridMirror, setGridMirror] = useState<CellContent[][]>(buildInitialGrid);
  const [historyLen, setHistoryLen] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  // Reveal is distinct from winning: it fills the board from `sol` and locks
  // input, but the level is NOT solved. Kept separate from gameWon so the
  // status reads "Revealed", never "Solved".
  const [revealed, setRevealed] = useState(false);
  // Hint state. `cells` are highlighted (others dim); `pendingCells` are striped
  // targets. Escalation for repeated presses on the SAME step is tracked by a
  // signature + level; any board change clears it (see the [gridMirror] effect).
  const [hintData, setHintData] = useState<{ text: string; cells: Set<string>; pendingCells: Set<string> } | null>(null);
  const hintSigRef = useRef<string>("");
  const hintLevelRef = useRef(0);
  const [gridSize, setGridSizePx] = useState(300);
  const [layoutReady, setLayoutReady] = useState(false);
  const outerRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);

  const handleBoardChange = useCallback((g: CellContent[][], history: BoardAction[]) => {
    setGridMirror(g);
    setHistoryLen(history.length);
  }, []);
  const handleBoardWin = useCallback(() => setGameWon(true), []);

  // Any board change invalidates the current hint (it is computed from the live
  // board), so drop it. This also resets the escalation so a fresh press starts
  // from level 1 for whatever the new "next step" is.
  useEffect(() => {
    setHintData(null);
    hintSigRef.current = "";
    hintLevelRef.current = 0;
  }, [gridMirror]);

  // ── Scales ───────────────────────────────────────────────────────────
  const chromeScale = gridSize / REFERENCE_GRID_WIDTH;

  const handleUndo = () => {
    if (gameWon || revealed) return;
    boardRef.current?.undo();
  };

  // Reveal the full solution via the board. Locks input but does NOT win.
  const handleReveal = () => {
    if (generating || gameWon || revealed) return;
    boardRef.current?.reveal();
    setRevealed(true);
  };

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
    const res = nextHintFromBoard(level, gridMirror);
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

  // ── Derived chrome values (board-internal values live in PlayBoard) ────
  const btnHeight = Math.max(28, 36 * chromeScale);
  const btnFontSize = Math.max(12, 15 * chromeScale);
  const btnGap = Math.max(4, 8 * chromeScale);
  const ruleItemH = Math.max(19, 19 * chromeScale);
  const ruleGap = 12 * chromeScale;
  const rulesPadTop = 16 * chromeScale;
  const rulesMinH = rulesPadTop + ruleItemH * 3 + ruleGap * 2;

  const placementErrors = getPlacementErrors(gridMirror, N, map);

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
          <PlayBoard
            ref={boardRef}
            level={level}
            gridSize={gridSize}
            showNameOnBoard={showNameOnBoard}
            initialGrid={buildInitialGrid()}
            locked={gameWon || revealed}
            won={gameWon}
            hintCells={hintData?.cells}
            hintPendingCells={hintData?.pendingCells}
            onChange={handleBoardChange}
            onWin={handleBoardWin}
            betweenBoardAndTray={
              <>
                {/* Spacer */}
                <div className="h-[16px] shrink-0" />

                {/* Undo + Hint buttons */}
                <div className="w-full px-[16px] shrink-0">
                  <div className="flex w-full" style={{ gap: btnGap }}>
                    <button
                      className="flex-1 rounded-[50px] relative bg-[#01394b] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                      style={{ opacity: historyLen === 0 || gameWon || revealed ? 0.3 : 1, height: btnHeight, gap: btnGap }}
                      onClick={handleUndo}
                      disabled={historyLen === 0 || gameWon || revealed}
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
              </>
            }
          />

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

      {/* Regeneration overlay (keeps the old board visible underneath) */}
      {generating && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10001, backgroundColor: "rgba(252,252,252,0.7)" }}>
          <span className="font-['Inter',sans-serif] font-semibold text-[15px] text-[#01394b]">Generating {size}×{size}…</span>
        </div>
      )}
    </div>
  );
}
