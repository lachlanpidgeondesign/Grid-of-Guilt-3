// Grid of Guilt — /play/ interactive tutorial (Phase 5).
//
// Seven steps on a dedicated 5×5 board + cast (Adam, Tom, Ruby, Kate, Eve),
// built on the shared PlayBoard with its tutorial overlay props (dimmed /
// hatched / X-only). The board owns its grid across steps 1–6 (no remount) so
// the X's the player places carry forward; step 7 remounts with the solved +
// revealed board. Steps 5–6 place suspects freely and show the real game's
// row / column / adjacency error marks; the reveal fires on PlayBoard's win.
//
// Single column on every screen, capped to the 500px content width.

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import PlayBoard, { getPlacementErrors, type CellContent } from "../app/shared/PlayBoard";
import type { RoomPalette } from "../app/generator/puzzleGenerator";
import ClueContent from "./ClueRow";
import { clueDisplayOrder } from "./clueOrder";
import {
  TUTORIAL_LEVEL,
  TUTORIAL_SUSPECTS,
  TUTORIAL_CLUES,
  TUTORIAL_CAST_NAMES,
  TUTORIAL_CAST_COLORS,
} from "./tutorialLevel";

const N = TUTORIAL_LEVEL.N;
const ADAM = 0, TOM = 1, RUBY = 2, KATE = 3, EVE = 4;
const [BODY_R, BODY_C] = TUTORIAL_LEVEL.crimeSceneCell as [number, number];

// Hatched (X these) cells per rule step, 0-indexed.
const H2 = ["3,3", "3,4", "4,2", "4,3", "4,4"]; // Study, minus Adam
const H3 = ["0,2", "1,2", "2,2", "3,0", "3,1"]; // column 3 + row 4 (cols 1–2)
const H4 = ["2,1", "2,3", "4,1"];               // Adam's remaining neighbours
const ADAM_KEY = `${TUTORIAL_LEVEL.sol[ADAM][0]},${TUTORIAL_LEVEL.sol[ADAM][1]}`;

function allCells(): string[] {
  const out: string[] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) out.push(`${r},${c}`);
  return out;
}

function prefersReducedMotion(): boolean {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
}

function buildInitialGrid(): CellContent[][] {
  const g: CellContent[][] = Array.from({ length: N }, () => Array<CellContent>(N).fill(null));
  const [ar, ac] = TUTORIAL_LEVEL.sol[ADAM];
  g[ar][ac] = ADAM;
  g[BODY_R][BODY_C] = "skull";
  return g;
}

// Solved board with every remaining empty cell X'd (step 7 reveal).
function buildRevealGrid(): CellContent[][] {
  const g: CellContent[][] = Array.from({ length: N }, () => Array<CellContent>(N).fill(null));
  for (let si = 0; si < N; si++) {
    const [r, c] = TUTORIAL_LEVEL.sol[si];
    g[r][c] = si;
  }
  g[BODY_R][BODY_C] = "skull";
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (g[r][c] === null) g[r][c] = "X";
  }
  return g;
}

interface TutorialScreenProps {
  /** Finish the tutorial (Skip or Start game): caller sets the seen flag. */
  onFinish: () => void;
}

// ── Small inline bits ─────────────────────────────────────────────────
function HatchSwatch() {
  return (
    <span className="inline-block align-middle rounded-[4px] border border-[#191919]" style={{ width: 26, height: 20, backgroundImage: "repeating-linear-gradient(-45deg, #191919 0 2px, #fcfcfc 2px 6px)" }} aria-label="hatched square" />
  );
}
function XSwatch() {
  return (
    <span className="inline-flex items-center justify-center align-middle rounded-[4px] border border-[#9aa6ab]" style={{ width: 24, height: 24 }} aria-label="X">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#5a6b72" strokeWidth="2.4" strokeLinecap="round" /></svg>
    </span>
  );
}
function RoomChipInline({ room }: { room: RoomPalette }) {
  // Match the board's room-label pill (uppercase bold, fill + dark border).
  return (
    <span
      className="inline-flex items-center font-['Inter:Bold',sans-serif] font-bold uppercase whitespace-nowrap align-middle"
      style={{
        backgroundColor: room.fill,
        border: `1.5px solid ${room.dark}`,
        color: "#fcfcfc",
        borderRadius: 999,
        padding: "1px 7px",
        fontSize: 11,
        letterSpacing: "0.03em",
        lineHeight: 1.35,
      }}
    >
      {room.name}
    </span>
  );
}
function PrimaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-[50px] bg-[#191919] text-[#fcfcfc] font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] px-[40px] py-[14px] border-none cursor-pointer">
      {label}
    </button>
  );
}

export default function TutorialScreen({ onFinish }: TutorialScreenProps) {
  const [step, setStep] = useState(1);
  const [grid, setGrid] = useState<CellContent[][]>(() => buildInitialGrid());
  const [boardKey, setBoardKey] = useState(0);
  const [gridSize, setGridSize] = useState(320);

  const rooms = TUTORIAL_LEVEL.rooms;
  const hallRoom = rooms.find((r) => r.name === "Hall")!;

  // ── Responsive sizing ──────────────────────────────────────────────
  // Single column, capped to the 500px content width AND to the viewport
  // height so everything fits without scrolling. The board height is the column
  // labels + grid + suspect tray; the tray and the clue list are ALWAYS
  // reserved (even on steps that don't show them) so the board stays the same
  // size on every step and the layout doesn't jump.
  useLayoutEffect(() => {
    const update = () => {
      let w = 390, h = 800;
      try { w = window.innerWidth; h = window.innerHeight; } catch { /* defaults */ }
      const widthCap = Math.min(w - 48, 452);
      // Board parts that scale with the grid g: column labels ≈ 15·(g/358)+12,
      // suspect tray ≈ 88·(g/358). WORST_CHROME is the page's fixed content at
      // its tallest step (paddings, title, subtitle, tip and the 4-clue list).
      const perG = 1 + (15 + 88) / 358; // ≈ 1.288
      const WORST_CHROME = 384;
      const heightCap = (h - WORST_CHROME - 12) / perG;
      setGridSize(Math.max(220, Math.min(widthCap, heightCap, 452)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Auto-advance for the X-marking rule steps (2–4) ─────────────────
  const hatchForStep = step === 2 ? H2 : step === 3 ? H3 : step === 4 ? H4 : [];
  useEffect(() => {
    if (step < 2 || step > 4) return;
    const target = step === 2 ? H2 : step === 3 ? H3 : H4;
    const done = target.every((k) => {
      const [r, c] = k.split(",").map(Number);
      return grid[r][c] === "X";
    });
    if (!done) return;
    const delay = prefersReducedMotion() ? 0 : 400;
    const t = window.setTimeout(() => setStep((s) => (s === step ? s + 1 : s)), delay);
    return () => window.clearTimeout(t);
  }, [grid, step]);

  // ── Overlays for the current step ───────────────────────────────────
  const xedKeys = new Set<string>();
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c] === "X") xedKeys.add(`${r},${c}`);

  let dimmedCells: Set<string> | undefined;
  let hatchedCells: Set<string> | undefined;
  let xOnlyCells: Set<string> | null | undefined;
  if (step >= 2 && step <= 4) {
    const lit = new Set<string>([ADAM_KEY, ...xedKeys, ...hatchForStep]);
    dimmedCells = new Set(allCells().filter((k) => !lit.has(k)));
    hatchedCells = new Set(hatchForStep.filter((k) => !xedKeys.has(k)));
    xOnlyCells = new Set(hatchForStep);
  }

  // ── Free placement (steps 5–6) ──────────────────────────────────────
  // Steps 5 and 6 behave like the real game: suspects go anywhere and the
  // board draws its own row / column / adjacency error marks. The reveal only
  // fires once every suspect is placed correctly (PlayBoard's win check).
  const handleChange = useCallback((g: CellContent[][]) => {
    setGrid(g.map((row) => [...row]));
  }, []);

  // Step 5 advances once Tom is in the Hall (clue true) with no rule error.
  // He can go in any valid Hall cell — we never force a single square.
  useEffect(() => {
    if (step !== 5) return;
    let tomPos: [number, number] | null = null;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c] === TOM) tomPos = [r, c];
    if (!tomPos) return;
    if (!TUTORIAL_LEVEL.clues[TOM].check(tomPos[0], tomPos[1])) return;
    if (getPlacementErrors(grid, N, TUTORIAL_LEVEL.map).hasError) return;
    setStep(6);
  }, [grid, step]);

  const handleWin = useCallback(() => {
    if (step !== 6) return;
    const delay = prefersReducedMotion() ? 0 : 900;
    window.setTimeout(() => {
      setGrid(buildRevealGrid());
      setBoardKey((k) => k + 1);
      setStep(7);
    }, delay);
  }, [step]);

  // ── Clue list (steps 5–6) ───────────────────────────────────────────
  const activeIdxs = [TOM, RUBY, KATE, EVE];
  const positions: Array<[number, number] | null> = Array.from({ length: N }, () => null);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const cell = grid[r][c];
    if (typeof cell === "number") positions[cell] = [r, c];
  }
  const satisfied = new Set<number>();
  for (const si of activeIdxs) {
    const p = positions[si];
    if (p && TUTORIAL_LEVEL.clues[si].check(p[0], p[1])) satisfied.add(si);
  }
  const displayOrder = clueDisplayOrder(activeIdxs, TUTORIAL_LEVEL.murdererIdx, satisfied);

  const showTray = step === 5 || step === 6;
  const showClues = step === 5 || step === 6;
  // Step 5 shows all four, but only Tom is active; step 6 offers the remaining three.
  const trayIdxs = step === 5 ? [TOM, RUBY, KATE, EVE] : step === 6 ? [RUBY, KATE, EVE] : undefined;
  const trayDisabledIdxs = step === 5 ? [RUBY, KATE, EVE] : undefined;

  const board = (
    <div>
      <PlayBoard
        key={boardKey}
        level={TUTORIAL_LEVEL}
        suspects={TUTORIAL_SUSPECTS}
        gridSize={gridSize}
        showNameOnBoard
        initialGrid={grid}
        locked={step === 7}
        won={step === 7}
        allowTray={showTray}
        trayColumns={step === 6 ? 3 : 4}
        trayShelf
        traySuspectIdxs={trayIdxs}
        trayDisabledIdxs={trayDisabledIdxs}
        dimmedCells={dimmedCells}
        hatchedCells={hatchedCells}
        xOnlyCells={xOnlyCells ?? null}
        onChange={handleChange}
        onWin={handleWin}
      />
    </div>
  );

  const clueList = showClues ? (
    <div className="flex flex-col gap-[10px] w-full">
      {displayOrder.map((si) => {
        const spec = TUTORIAL_CLUES[si];
        if (!spec) return null;
        const done = satisfied.has(si);
        return (
          <div key={si} className="flex items-start gap-[8px] w-full" style={{ opacity: done ? 0.5 : 1 }}>
            <span className="shrink-0 mt-[1px] flex items-center justify-center rounded-[4px] border border-[#9aa6ab]" style={{ width: 20, height: 20, backgroundColor: done ? "#9aa6ab" : "#fcfcfc" }}>
              {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fcfcfc" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" /></svg>}
            </span>
            <span className="flex-1 min-w-0 font-['Inter',sans-serif] text-[14px] leading-[20px] text-[#191919]">
              <span className="font-['Inter:Bold',sans-serif] font-bold underline" style={{ color: TUTORIAL_CAST_COLORS[si] }}>{TUTORIAL_CAST_NAMES[si]}</span>{" "}
              <ClueContent spec={spec} rooms={rooms} suspectNames={TUTORIAL_CAST_NAMES} suspectColors={TUTORIAL_CAST_COLORS} />
            </span>
          </div>
        );
      })}
    </div>
  ) : null;

  // ── Per-step copy ───────────────────────────────────────────────────
  const subtitle = (() => {
    switch (step) {
      case 1: return <>A murder has taken place in this house!</>;
      case 2: return <>Rule: Only one suspect per <strong>room</strong></>;
      case 3: return <>Rule: Only one suspect per <strong>row</strong> and <strong>column</strong></>;
      case 4: return <>Rule: Suspects can't <strong>touch</strong>, even diagonally</>;
      case 5: return <>Rule: All the clues must be <strong>true</strong></>;
      case 6: return <>Now finish the puzzle.</>;
      case 7: return <><span className="font-['Inter:Semi_Bold',sans-serif] font-semibold">Eve</span> is the murderer!</>;
    }
  })();

  const belowBoard = (() => {
    if (step === 1) {
      return (
        <>
          <p className="font-['Inter',sans-serif] text-[16px] leading-[24px] text-[#191919] text-center">
            To catch the killer, you'll need to find out where everyone was at the time of the murder. The murderer was in the same room as the victim. No one can stand where the body lies.
          </p>
          <div className="flex justify-center pt-[4px]"><PrimaryButton label="Next" onClick={() => setStep(2)} /></div>
        </>
      );
    }
    if (step >= 2 && step <= 4) {
      return (
        <>
          <p className="font-['Inter',sans-serif] text-[16px] leading-[24px] text-[#191919] text-center">
            <strong>Tip:</strong> place X's to mark where suspects can't go.
          </p>
          <p className="font-['Inter',sans-serif] text-[16px] leading-[24px] text-[#191919] text-center flex items-center justify-center gap-[6px] flex-wrap">
            Tap on the <HatchSwatch /> squares to place a <XSwatch />
          </p>
        </>
      );
    }
    if (step === 5) {
      return (
        <p className="font-['Inter',sans-serif] text-[16px] leading-[24px] text-[#191919] text-center flex items-center justify-center gap-[6px] flex-wrap">
          <strong>Tip:</strong>{" "}
          <span className="font-['Inter:Bold',sans-serif] font-bold underline" style={{ color: TUTORIAL_CAST_COLORS[TOM] }}>Tom</span>{" "}
          must be in the <RoomChipInline room={hallRoom} />. Where can he go?
        </p>
      );
    }
    if (step === 7) {
      return (
        <>
          <p className="font-['Inter',sans-serif] text-[16px] leading-[24px] text-[#191919] text-center">
            Well done! Eve was in the same room as the murder victim. Are you ready to play?
          </p>
          <div className="flex justify-center pt-[4px]"><PrimaryButton label="Start game" onClick={onFinish} /></div>
        </>
      );
    }
    return null;
  })();

  const title = (
    <h1 className="font-['Literata',serif] font-extrabold text-[28px] leading-[34px] text-[#191919] text-center">How to Play Grid of Guilt</h1>
  );
  const skip = (
    <button onClick={onFinish} className="absolute right-[20px] top-[16px] font-['Inter',sans-serif] text-[17px] text-[#191919] bg-transparent border-none cursor-pointer p-[4px]" style={{ zIndex: 5 }}>Skip</button>
  );
  const subtitleEl = (
    <p
      className={step === 7
        ? "font-['Literata',serif] font-extrabold text-[22px] leading-[28px] text-[#191919] text-center"
        : "font-['Inter',sans-serif] text-[18px] leading-[24px] text-[#191919] text-center"}
    >
      {subtitle}
    </p>
  );

  return (
    <div className="fixed inset-0 bg-[#f7f5f2] overflow-y-auto" style={{ zIndex: 10001 }}>
      {skip}
      <div className="min-h-full flex flex-col items-center px-[20px] pt-[48px] pb-[32px]">
        <div className="w-full max-w-[500px] flex flex-col items-center gap-[16px]">
          {title}
          {subtitleEl}
          {board}
          <div className="flex flex-col gap-[14px]" style={{ width: gridSize }}>
            {belowBoard}
            {clueList}
          </div>
        </div>
      </div>
    </div>
  );
}
