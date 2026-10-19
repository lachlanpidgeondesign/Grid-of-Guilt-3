// Grid of Guilt — /play/ How to Play screen (Phase 6).
//
// A standalone reference screen for /play/ only. It does NOT touch the daily
// game's HowToPlayModal. Centred modal on desktop (≥640px), full-height bottom
// sheet on mobile. Closes with the ✕, Escape, or a tap on the backdrop; focus
// moves to the close button on open and is restored on close.

import { useEffect, useRef } from "react";
import SuspectTile from "../app/shared/SuspectTile";
import { TUTORIAL_SUSPECTS } from "./tutorialLevel";

const ADAM = TUTORIAL_SUSPECTS[0];
const TOM = TUTORIAL_SUSPECTS[1];
const RUBY = TUTORIAL_SUSPECTS[2];
const HALL_FILL = "#2FB3C4";
const HALL_DARK = "#1E8291";

interface HowToPlayScreenProps {
  onClose: () => void;
  onReplayTutorial: () => void;
}

// ── Mini-board primitives ─────────────────────────────────────────────
const RED_HATCH = "repeating-linear-gradient(-45deg, #e3202d 0 3px, rgba(255,255,255,0) 3px 9px)";

function MiniTile({ s, cell }: { s: typeof ADAM; cell: number }) {
  const scale = (cell - 6) / 64;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <SuspectTile name={s.name} color={s.color} spritePos={s.sprite} showEveBadge={false} inGrid gridScale={scale} />
    </div>
  );
}

interface MiniCell {
  fill?: string;
  suspect?: typeof ADAM;
  hatch?: boolean;
}

function MiniBoard({
  rows, cols, cell, cells, vDivAfterCol, chip,
}: {
  rows: number;
  cols: number;
  cell: number;
  cells: Record<string, MiniCell>;
  vDivAfterCol?: number;
  chip?: { text: string; fill: string; dark: string; col: number; span: number };
}) {
  const w = cols * cell;
  const h = rows * cell;
  return (
    <div className="relative shrink-0" style={{ width: w, height: h + 6 }}>
      <div
        className="relative"
        style={{ width: w, height: h, borderRadius: 10, border: "2px solid #191919", boxShadow: "0px 2px 0px 0px #191919", overflow: "hidden", backgroundColor: "#fcfcfc" }}
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const spec = cells[`${r},${c}`] ?? {};
            return (
              <div
                key={`${r},${c}`}
                className="absolute"
                style={{ left: c * cell, top: r * cell, width: cell, height: cell, backgroundColor: spec.fill, boxShadow: "inset 0 0 0 0.5px #cfd6d9" }}
              >
                {spec.suspect && <MiniTile s={spec.suspect} cell={cell} />}
                {spec.hatch && <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: RED_HATCH }} />}
              </div>
            );
          }),
        )}
        {vDivAfterCol != null && (
          <div className="absolute pointer-events-none" style={{ left: vDivAfterCol * cell, top: 0, width: 2.5, height: h, backgroundColor: "#191919" }} />
        )}
      </div>
      {chip && (
        <div
          className="absolute font-['Inter:Bold',sans-serif] font-bold uppercase flex items-center justify-center whitespace-nowrap"
          style={{
            left: (chip.col + chip.span / 2) * cell,
            top: 0,
            transform: "translate(-50%, -50%)",
            height: 15,
            padding: "0 6px",
            fontSize: 9,
            letterSpacing: "0.03em",
            color: "#fcfcfc",
            backgroundColor: chip.fill,
            border: `1.5px solid ${chip.dark}`,
            borderRadius: 8,
          }}
        >
          {chip.text}
        </div>
      )}
    </div>
  );
}

// ── Rule illustrations ────────────────────────────────────────────────
function RuleRowColBoard() {
  const cell = 46;
  const cells: Record<string, MiniCell> = {
    "0,0": { suspect: RUBY, hatch: true }, "0,1": { hatch: true }, "0,2": { suspect: ADAM, hatch: true },
    "1,2": { hatch: true },
    "2,2": { suspect: TOM, hatch: true },
  };
  return <MiniBoard rows={3} cols={3} cell={cell} cells={cells} />;
}

function RuleTouchBoard() {
  const cell = 46;
  // Adam at centre; every surrounding cell (incl. diagonals) is off-limits.
  const cells: Record<string, MiniCell> = {
    "0,0": { suspect: RUBY, hatch: true }, "0,1": { hatch: true }, "0,2": { hatch: true },
    "1,0": { hatch: true }, "1,1": { suspect: ADAM }, "1,2": { hatch: true },
    "2,0": { hatch: true }, "2,1": { hatch: true }, "2,2": { hatch: true },
  };
  return <MiniBoard rows={3} cols={3} cell={cell} cells={cells} />;
}

function RuleRoomBoard() {
  const cell = 46;
  const tint = HALL_FILL + "22";
  // Hall fills the left two columns; two suspects in the one room is illegal.
  const cells: Record<string, MiniCell> = {
    "0,0": { fill: tint, suspect: RUBY, hatch: true }, "0,1": { fill: tint, hatch: true },
    "1,0": { fill: tint }, "1,1": { fill: tint },
    "2,0": { fill: tint }, "2,1": { fill: tint, suspect: ADAM, hatch: true },
  };
  return (
    <MiniBoard
      rows={3}
      cols={3}
      cell={cell}
      cells={cells}
      vDivAfterCol={2}
      chip={{ text: "Hall", fill: HALL_FILL, dark: HALL_DARK, col: 0, span: 2 }}
    />
  );
}

// ── Cell-mark TIP diagrams ────────────────────────────────────────────
function MarkCell({ kind }: { kind: "empty" | "x" | "dot" }) {
  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: 46, height: 46, backgroundColor: HALL_FILL + "22", border: "2px solid #191919", borderRadius: 8 }}>
      {kind === "x" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#5a6b72" strokeWidth="2.4" strokeLinecap="round" /></svg>
      )}
      {kind === "dot" && <span className="rounded-full" style={{ width: 12, height: 12, backgroundColor: "#191919" }} />}
    </div>
  );
}
function Arrow() {
  return (
    <svg width="26" height="14" viewBox="0 0 26 14" fill="none" className="shrink-0"><path d="M1 7h22M18 2l5 5-5 5" stroke="#9aa6ab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

// ── Layout helpers ────────────────────────────────────────────────────
function RuleRow({ text, children }: { text: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[16px] py-[18px] border-t border-[#e2e0dc]">
      <p className="flex-1 min-w-0 font-['Inter',sans-serif] text-[17px] leading-[24px] text-[#191919]">{text}</p>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function HallChipInline() {
  return (
    <span className="inline-flex items-center font-['Inter:Bold',sans-serif] font-bold uppercase rounded-[8px] px-[6px] py-[1px] text-[#fcfcfc] whitespace-nowrap align-middle" style={{ backgroundColor: HALL_FILL, border: `1.5px solid ${HALL_DARK}`, fontSize: 11, letterSpacing: "0.03em" }}>
      Hall
    </span>
  );
}

export default function HowToPlayScreen({ onClose, onReplayTutorial }: HowToPlayScreenProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevFocus = useRef<Element | null>(null);

  useEffect(() => {
    try { prevFocus.current = document.activeElement; } catch { /* ignore */ }
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      const el = prevFocus.current as HTMLElement | null;
      if (el && typeof el.focus === "function") el.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 10003, backgroundColor: "rgba(1,24,31,0.8)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="How to play"
        className="relative bg-[#f7f5f2] w-full sm:w-auto sm:max-w-[520px] rounded-t-[20px] sm:rounded-[20px] flex flex-col overflow-hidden"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-[14px] top-[14px] w-[36px] h-[36px] flex items-center justify-center bg-transparent border-none cursor-pointer p-0 rounded-full"
          style={{ zIndex: 5 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#191919" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        <div className="overflow-y-auto px-[24px] pt-[28px] pb-[24px]">
          <h1 className="font-['Literata',serif] font-extrabold text-[28px] leading-[34px] text-[#191919] text-center pr-[24px]">How to Play Grid of Guilt</h1>

          <p className="font-['Inter',sans-serif] text-[17px] leading-[24px] text-[#191919] mt-[20px]">
            A murder has taken place in this house. The murderer was alone in the same room as the victim.
          </p>
          <p className="font-['Inter',sans-serif] text-[17px] leading-[24px] text-[#191919] mt-[16px]">
            Use your deduction skills to find out where everyone was at the time of the murder.
          </p>

          <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[18px] text-[#191919] mt-[24px] mb-[2px]">Rules</h2>

          <RuleRow text={<>Each row and column can only have one suspect.</>}>
            <RuleRowColBoard />
          </RuleRow>
          <RuleRow text={<>Suspects can't touch — not even diagonally.</>}>
            <RuleTouchBoard />
          </RuleRow>
          <RuleRow text={<>Each room can only have one suspect.</>}>
            <RuleRoomBoard />
          </RuleRow>
          <RuleRow text={<>Each suspect has their own rule that you must follow when placing them.</>}>
            <div className="flex flex-col items-center gap-[8px]">
              <SuspectTile name={TOM.name} color={TOM.color} spritePos={TOM.sprite} showEveBadge={false} />
              <p className="font-['Inter',sans-serif] text-[14px] leading-[18px] text-[#191919] text-center">
                <span className="font-['Inter:Bold',sans-serif] font-bold underline" style={{ color: TOM.color }}>Tom</span> must be in the <HallChipInline />
              </p>
            </div>
          </RuleRow>

          <div className="flex items-start gap-[16px] py-[18px] border-t border-[#e2e0dc]">
            <p className="flex-1 min-w-0 font-['Inter',sans-serif] text-[17px] leading-[24px] text-[#191919]">
              <strong>Tip:</strong> Tap an empty cell to mark it with an X, and tap again to mark it with a dot. Use X marks to eliminate cells where suspects can't go, and dots for where a suspect must be. Drag across cells to mark several X's at once.
            </p>
            <div className="shrink-0 flex flex-col gap-[12px]">
              <div className="flex items-center gap-[8px]"><MarkCell kind="empty" /><Arrow /><MarkCell kind="x" /></div>
              <div className="flex items-center gap-[8px]"><MarkCell kind="x" /><Arrow /><MarkCell kind="dot" /></div>
            </div>
          </div>

          <button
            onClick={onReplayTutorial}
            className="w-full mt-[20px] rounded-[50px] bg-transparent text-[#191919] font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] py-[14px] border border-[#678893] cursor-pointer"
          >
            Replay tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
