// Grid of Guilt — /play/ level player. Header + game bar + PlayBoard + clue
// list, with timer, pause, undo, hint, restart, share, saved-state resume and
// the win → results hand-off. Mobile layout stacks top-to-bottom; from 900px
// wide it splits into a board column and a tray + clue column.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import PlayBoard, { type CellContent, type BoardAction, type PlayBoardHandle } from "../app/shared/PlayBoard";
import { LEVELS, loadLevelClueSpecs, type LevelId } from "../app/levels/loadLevel";
import { suspectsForSize } from "../app/generator/suspects";
import ClueContent from "./ClueRow";
import { computeHint, type PlayHint } from "./playHint";
import { activeSuspectIdxs, clueDisplayOrder } from "./clueOrder";
import {
  loadLevelState,
  saveLevelState,
  clearLevelState,
  recordSolve,
  formatTime,
  LEVEL_LABEL,
  type PersistedLevelState,
} from "./storage";
import { playUrl, shareOrCopy } from "./share";

const DESKTOP_MIN = 900;
const AVATAR_ONLY_AT_N = 7;

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export interface SolveResult {
  levelId: LevelId;
  seconds: number;
  hints: number;
}

interface LevelPlayerProps {
  levelId: LevelId;
  onBackToLanding: () => void;
  onSolved: (result: SolveResult) => void;
  onHowToPlay: () => void;
  /** Freeze the timer without showing the pause panel (e.g. while an overlay
   *  like Replay tutorial is covering the level). */
  suspended?: boolean;
}

// ── Small inline icons ────────────────────────────────────────────────
const PauseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="#191919" /><rect x="14" y="5" width="4" height="14" rx="1.2" fill="#191919" /></svg>
);
const UndoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 7H15a4 4 0 0 1 0 8H8" stroke="#191919" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 4L6 7L9 10" stroke="#191919" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const HintIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 21h4" stroke="#191919" strokeWidth="1.8" strokeLinecap="round" /><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1.3 1.5 1.5 2.5h5c.2-1 .7-1.7 1.5-2.5A6 6 0 0 0 12 3Z" stroke="#191919" strokeWidth="1.8" strokeLinejoin="round" /></svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.9" fill="#191919" /><circle cx="12" cy="12" r="1.9" fill="#191919" /><circle cx="19" cy="12" r="1.9" fill="#191919" /></svg>
);
const CheckIcon = ({ color = "#1a7a3a" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
);

function RoundButton({ onClick, disabled, label, children }: { onClick: () => void; disabled?: boolean; label: string; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="rounded-full relative flex items-center justify-center cursor-pointer disabled:cursor-not-allowed border-none shadow-[0px_1.2px_0px_0px_#678893]"
      style={{ width: 44, height: 44, backgroundColor: "#fcfcfc", opacity: disabled ? 0.4 : 1 }}
    >
      <span aria-hidden="true" className="absolute inset-0 rounded-full border border-[#678893] pointer-events-none" />
      {children}
    </button>
  );
}

export default function LevelPlayer({ levelId, onBackToLanding, onSolved, onHowToPlay, suspended = false }: LevelPlayerProps) {
  const level = LEVELS[levelId];
  const N = level.N;
  const specs = loadLevelClueSpecs(levelId);
  const suspects = suspectsForSize(N);
  const suspectNames = suspects.map((s) => s.name);
  const suspectColors = suspects.map((s) => s.color);
  const showNameOnBoard = N < AVATAR_ONLY_AT_N;
  const activeIdxs = activeSuspectIdxs(level);

  // Tray layout: 5\u00d75 \u2192 one row of 4, 7\u00d77 \u2192 3\u00d72 block, 9\u00d79 \u2192 4\u00d72 block.
  const trayColumns = N === 7 ? 3 : 4;
  const trayRows = Math.ceil((N - 1) / trayColumns);

  const buildInitialGrid = useCallback((): CellContent[][] => {
    const g: CellContent[][] = Array.from({ length: N }, () => Array<CellContent>(N).fill(null));
    const [sr, sc] = level.sol[level.starterIdx];
    g[sr][sc] = level.starterIdx;
    const crime = level.crimeSceneCell;
    if (crime) g[crime[0]][crime[1]] = "skull";
    return g;
  }, [N, level]);

  // Restore saved progress once (fresh board if absent or corrupt).
  const restored = useRef<PersistedLevelState | null>(loadLevelState(levelId, N)).current;
  const initialGridRef = useRef<CellContent[][]>(restored ? (restored.grid as CellContent[][]) : buildInitialGrid());
  const initialHistoryRef = useRef<BoardAction[]>(restored ? (restored.history as BoardAction[]) : []);

  const [boardKey, setBoardKey] = useState(0);
  const [gridMirror, setGridMirror] = useState<CellContent[][]>(initialGridRef.current);
  const [historyLen, setHistoryLen] = useState(initialHistoryRef.current.length);
  const [elapsed, setElapsed] = useState(restored?.elapsedSeconds ?? 0);
  const [hints, setHints] = useState(restored?.hints ?? 0);
  const [won, setWon] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hintData, setHintData] = useState<PlayHint | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const boardRef = useRef<PlayBoardHandle>(null);
  const gridRef = useRef(gridMirror); gridRef.current = gridMirror;
  const historyRef = useRef<BoardAction[]>(initialHistoryRef.current);
  const elapsedRef = useRef(elapsed); elapsedRef.current = elapsed;
  const hintsRef = useRef(hints); hintsRef.current = hints;
  const wonRef = useRef(false);

  // Persist the in-progress board (not called once solved — that state is wiped).
  const persist = useCallback(() => {
    if (wonRef.current) return;
    saveLevelState(levelId, {
      grid: gridRef.current as PersistedLevelState["grid"],
      history: historyRef.current as PersistedLevelState["history"],
      elapsedSeconds: elapsedRef.current,
      hints: hintsRef.current,
    });
  }, [levelId]);

  const handleBoardChange = useCallback((g: CellContent[][], history: BoardAction[]) => {
    gridRef.current = g;
    historyRef.current = history;
    setGridMirror(g);
    setHistoryLen(history.length);
    setHintData(null);
    persist();
  }, [persist]);

  const handleWin = useCallback(() => {
    if (wonRef.current) return;
    wonRef.current = true;
    const result: SolveResult = { levelId, seconds: elapsedRef.current, hints: hintsRef.current };
    recordSolve(levelId, result.seconds, result.hints);
    clearLevelState(levelId);
    setWon(true);
    setHintData(null);
    setMenuOpen(false);
    const delay = prefersReducedMotion() ? 0 : 1500;
    window.setTimeout(() => onSolved(result), delay);
  }, [levelId, onSolved]);

  // Timer: ticks each second while playing (not paused, not won, not suspended).
  useEffect(() => {
    if (paused || won || suspended) return;
    const t = window.setInterval(() => {
      setElapsed((e) => { const n = e + 1; elapsedRef.current = n; return n; });
      persist();
    }, 1000);
    return () => window.clearInterval(t);
  }, [paused, won, suspended, persist]);

  // Auto-pause when the tab is hidden or the page is left.
  useEffect(() => {
    const onVis = () => { if (document.hidden && !wonRef.current) setPaused(true); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const handleHint = () => {
    if (won) return;
    if (hintData) { setHintData(null); return; }
    const h = computeHint(level, gridRef.current, suspectNames);
    setHintData(h);
    setHints((n) => { const v = n + 1; hintsRef.current = v; return v; });
    persist();
  };

  const handleUndo = () => {
    if (won || historyLen === 0) return;
    boardRef.current?.undo();
  };

  const handleRestart = () => {
    clearLevelState(levelId);
    const g = buildInitialGrid();
    initialGridRef.current = g;
    initialHistoryRef.current = [];
    gridRef.current = g;
    historyRef.current = [];
    elapsedRef.current = 0;
    hintsRef.current = 0;
    setGridMirror(g);
    setHistoryLen(0);
    setElapsed(0);
    setHints(0);
    setHintData(null);
    setConfirmRestart(false);
    setMenuOpen(false);
    setPaused(false);
    setBoardKey((k) => k + 1);
  };

  const handleShare = async () => {
    const url = playUrl();
    const text = won
      ? `I caught the murderer on Grid of Guilt ${LEVEL_LABEL[levelId]} in ${formatTime(elapsedRef.current)}`
      : "Grid of Guilt — can you catch the murderer?";
    const outcome = await shareOrCopy(text, url);
    if (outcome === "copied") {
      setShareNote("Link copied");
      window.setTimeout(() => setShareNote(null), 1800);
    }
  };

  // ── Satisfied clues + display order ──────────────────────────────────
  const positions: Array<[number, number] | null> = Array.from({ length: N }, () => null);
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const cell = gridMirror[r][c];
      if (typeof cell === "number") positions[cell] = [r, c];
    }
  }
  const satisfied = new Set<number>();
  for (const si of activeIdxs) {
    const p = positions[si];
    if (p && level.clues[si].check(p[0], p[1])) satisfied.add(si);
  }
  const displayOrder = clueDisplayOrder(activeIdxs, level.murdererIdx, satisfied);

  // ── Responsive board sizing + desktop split ──────────────────────────
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    try { return window.innerWidth >= DESKTOP_MIN; } catch { return false; }
  });
  const [gridSize, setGridSize] = useState(300);
  const [trayEl, setTrayEl] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      let w = 390, h = 800;
      try { w = window.innerWidth; h = window.innerHeight; } catch { /* keep defaults */ }
      const desktop = w >= DESKTOP_MIN;
      setIsDesktop(desktop);
      const chrome = 56; // single top bar
      const labelAllow = 44;
      if (desktop) {
        // Board fits the viewport height; the two columns sit together inside a
        // capped, centred container, so the board no longer tracks viewport
        // width — just height, with a sensible cap that leaves room beside it
        // for the fixed-width suspect/clue column.
        const availH = h - chrome - 40 - labelAllow;
        setGridSize(Math.max(240, Math.min(availH, 440)));
      } else {
        // Shrink the board just enough that the inline tray and the full clue
        // list fit under it when they can; fall back to a 200px floor + scroll.
        const availW = Math.min(w - 72, 440); // leave room for row labels
        // Tray height grows with the board: trayTile = 64 * (gridSize / (71.6 * N)).
        const trayUnit = (trayRows * 64 + (trayRows - 1) * 12) / (71.6 * N);
        const trayPad = 24;
        const clueReserve = (N - 1) * 30 + 28; // ~30px per clue row + padding
        const fixed = chrome + labelAllow + trayPad + clueReserve;
        const fit = (h - fixed) / (1 + trayUnit); // board size that fits everything
        setGridSize(Math.max(200, Math.min(availW, 440, fit)));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const board = (
    <PlayBoard
      key={boardKey}
      ref={boardRef}
      level={level}
      gridSize={gridSize}
      showNameOnBoard={showNameOnBoard}
      initialGrid={initialGridRef.current}
      initialHistory={initialHistoryRef.current}
      locked={won || paused}
      won={won}
      trayPortal={isDesktop ? trayEl : null}
      trayColumns={trayColumns}
      trayShelf={!isDesktop}
      hintCells={hintData?.cells}
      hintPendingCells={hintData?.pendingCells}
      onChange={handleBoardChange}
      onWin={handleWin}
    />
  );

  const clueList = (
    <div className="flex flex-col gap-[10px] w-full">
      {displayOrder.map((si) => {
        const spec = specs[si];
        if (!spec) return null;
        const done = satisfied.has(si);
        return (
          <div key={si} className="flex items-start gap-[8px] w-full" style={{ opacity: done ? 0.5 : 1 }}>
            <span className="shrink-0 mt-[2px]" style={{ width: 14, height: 14 }}>
              {done ? <CheckIcon /> : <span className="block rounded-full" style={{ width: 12, height: 12, backgroundColor: suspects[si].color }} />}
            </span>
            <span className="flex-1 min-w-0 font-['Inter',sans-serif] text-[14px] leading-[20px] text-[#191919]">
              <span className="font-['Inter:Bold',sans-serif] font-bold underline" style={{ color: suspects[si].color }}>{suspects[si].name}</span>{" "}
              <ClueContent spec={spec} rooms={level.rooms} suspectNames={suspectNames} suspectColors={suspectColors} />
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-[#fcfcfc]" style={{ zIndex: 10001 }}>
      {/* Single top bar: pale background, no title, no knife.
          Left: back, pause, timer. Right: undo, hint, ••• (Share lives there).
          Items capped to the 1000px game-area width, centred. */}
      <div className="h-[56px] shrink-0 w-full bg-[#e6ebed] relative">
        <div aria-hidden="true" className="absolute inset-0 border-b border-[#678893] pointer-events-none" />
        <div className="h-full w-full max-w-[1000px] mx-auto flex items-center px-[12px] gap-[8px] relative">
          <button onClick={onBackToLanding} aria-label="Back to levels" className="w-[36px] h-[36px] flex items-center justify-center bg-transparent border-none cursor-pointer p-0 shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="#01394b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          </button>
          <RoundButton onClick={() => setPaused(true)} disabled={won} label="Pause"><PauseIcon /></RoundButton>
          <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-[#01394b] tabular-nums" style={{ minWidth: 48 }}>{formatTime(elapsed)}</span>
          <div className="flex-1" />
          <div className="flex items-center gap-[8px]">
            <RoundButton onClick={handleUndo} disabled={won || historyLen === 0} label="Undo"><UndoIcon /></RoundButton>
            <RoundButton onClick={handleHint} disabled={won} label="Hint"><HintIcon /></RoundButton>
            <RoundButton onClick={() => setMenuOpen((o) => !o)} label="More"><MenuIcon /></RoundButton>
          </div>

          {menuOpen && (
            <>
              <div className="fixed inset-0" style={{ zIndex: 20 }} onClick={() => setMenuOpen(false)} />
              <div className="absolute right-[12px] top-[56px] bg-[#fcfcfc] rounded-[12px] shadow-[0px_4px_16px_rgba(0,0,0,0.25)] overflow-hidden" style={{ zIndex: 21, minWidth: 160 }}>
                <button onClick={() => { setMenuOpen(false); handleShare(); }} className="block w-full text-left px-[16px] py-[12px] font-['Inter',sans-serif] text-[14px] text-[#191919] bg-transparent border-none cursor-pointer hover:bg-[#f0f3f4]">Share</button>
                <button onClick={() => { setMenuOpen(false); onHowToPlay(); }} className="block w-full text-left px-[16px] py-[12px] font-['Inter',sans-serif] text-[14px] text-[#191919] bg-transparent border-none cursor-pointer hover:bg-[#f0f3f4]">How to play</button>
                <button onClick={() => { setMenuOpen(false); setConfirmRestart(true); }} className="block w-full text-left px-[16px] py-[12px] font-['Inter',sans-serif] text-[14px] text-[#c0392b] bg-transparent border-none cursor-pointer hover:bg-[#f0f3f4]">Restart level</button>
              </div>
            </>
          )}
          {shareNote && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[56px] bg-[#191919] text-[#fcfcfc] text-[12px] font-['Inter',sans-serif] rounded-[6px] px-[10px] py-[5px]" style={{ zIndex: 21 }}>{shareNote}</div>
          )}
        </div>
      </div>

      {/* Body */}
      {isDesktop ? (
        <div className="flex-1 min-h-0 flex justify-center overflow-hidden relative">
          <div className="flex gap-[24px] items-start justify-center w-full max-w-[1000px] px-[16px] pt-[20px] min-h-0">
            <div className="shrink-0 flex flex-col items-center" id="play-board-col">
              {board}
            </div>
            <div className="w-[380px] shrink-0 flex flex-col overflow-y-auto gap-[16px] max-h-full">
              <div ref={setTrayEl} className="shrink-0" />
              <div aria-hidden="true" className="shrink-0 border-t border-[#678893]" />
              {hintData && <HintBanner text={hintData.text} />}
              {clueList}
            </div>
          </div>
          {paused && <PausePanel onResume={() => setPaused(false)} />}
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          <div className="shrink-0 flex flex-col items-center pt-[8px]" id="play-board-col">
            {board}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto w-full flex justify-center">
            <div className="w-full max-w-[460px] px-[16px] pt-[8px] pb-[16px] flex flex-col gap-[12px]">
              {hintData && <HintBanner text={hintData.text} />}
              {clueList}
            </div>
          </div>
          {paused && <PausePanel onResume={() => setPaused(false)} />}
        </div>
      )}

      {/* Restart confirm */}
      {confirmRestart && (
        <div className="fixed inset-0 flex items-center justify-center px-[24px]" style={{ zIndex: 10005, backgroundColor: "rgba(1,24,31,0.7)" }}>
          <div className="bg-[#fcfcfc] w-full max-w-[340px] rounded-[16px] p-[24px] flex flex-col gap-[16px]">
            <p className="font-['Literata',serif] font-extrabold text-[18px] text-[#191919]">Restart level?</p>
            <p className="font-['Inter',sans-serif] text-[14px] text-[#191919]">This clears the board, timer and hint count for this level.</p>
            <div className="flex flex-col gap-[10px]">
              <button onClick={handleRestart} className="w-full rounded-[50px] bg-[#c0392b] text-[#fcfcfc] font-['Inter',sans-serif] font-semibold text-[15px] py-[12px] border-none cursor-pointer">Restart</button>
              <button onClick={() => setConfirmRestart(false)} className="w-full rounded-[50px] bg-[#fcfcfc] text-[#191919] font-['Inter',sans-serif] font-semibold text-[15px] py-[12px] border border-[#678893] cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HintBanner({ text }: { text: string }) {
  return (
    <div className="relative w-full rounded-[8px] bg-[#e6ebed] border border-[#678893] px-[12px] py-[10px] shrink-0">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-black" style={{ lineHeight: 1.35 }}>{text}</p>
    </div>
  );
}

function PausePanel({ onResume }: { onResume: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-[20px] bg-[#fcfcfc]" style={{ zIndex: 15 }}>
      <p className="font-['Literata',serif] font-extrabold text-[24px] text-[#01394b]">Paused</p>
      <button onClick={onResume} className="rounded-[50px] bg-[#01394b] text-[#fcfcfc] font-['Inter',sans-serif] font-semibold text-[15px] px-[28px] py-[12px] border-none cursor-pointer">Resume</button>
    </div>
  );
}
