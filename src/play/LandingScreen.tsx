// Grid of Guilt — /play/ landing screen.
//
// Mirrors StartScreen's visual language (deep-teal field, Literata title, Inter
// body, pill buttons) without importing or editing it. Shows the three fixed
// levels with their unlock state, a solved tick + best time, an "In progress"
// hint, a solved-level replay sheet and a How to Play link. A debug-only Reset
// control appears when the URL carries ?debug.

import { useState, type ReactNode } from "react";
import imgSubtract from "figma:asset/11b5ce8aa84fd3a9434dff203971b2be0db80ee7.png";
import imgKnife from "figma:asset/58d165bd57360408c1c72634c155b7d947ea2f28.png";
import type { LevelId } from "../app/levels/loadLevel";
import {
  LEVEL_ORDER,
  LEVEL_LABEL,
  LEVEL_GRID,
  isUnlocked,
  lockMessage,
  hasLevelState,
  formatTime,
  type ProgressMap,
} from "./storage";

interface LandingScreenProps {
  progress: ProgressMap;
  debug: boolean;
  onPlay: (id: LevelId) => void;
  onReplay: (id: LevelId) => void;
  onHowToPlay: () => void;
  onReset: () => void;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="#01394b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="#678893" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#678893" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function LandingScreen({
  progress,
  debug,
  onPlay,
  onReplay,
  onHowToPlay,
  onReset,
}: LandingScreenProps) {
  // The solved-level sheet: null when closed, else the level it's acting on.
  const [sheetFor, setSheetFor] = useState<LevelId | null>(null);

  const handleLevelTap = (id: LevelId) => {
    if (!isUnlocked(id, progress)) return;
    const entry = progress[id];
    if (entry?.solved) {
      setSheetFor(id);
    } else {
      onPlay(id);
    }
  };

  return (
    <div className="bg-[#01394b] fixed inset-0 flex flex-col items-center overflow-y-auto" style={{ zIndex: 10001 }}>
      <div className="flex flex-col items-center w-[300px] max-w-[88vw] py-[48px] gap-[40px]">
        {/* Crime Desk wordmark */}
        <div className="flex flex-col items-center">
          <div className="h-[48px] w-[160.7px] relative">
            <img alt="The Crime Desk" className="absolute block max-w-none size-full" src={imgSubtract} />
          </div>
          <p className="font-['Inter',sans-serif] font-normal text-[13px] text-[#fcfcfc] text-center" style={{ lineHeight: "18px" }}>Presents</p>
        </div>

        {/* Knife + title */}
        <div className="flex flex-col gap-[20px] items-center">
          <div style={{ filter: "drop-shadow(0px 5px 0px #678893)" }}>
            <img src={imgKnife} alt="Knife" className="block" style={{ width: 112, height: 100, objectFit: "contain" }} />
          </div>
          <div className="flex flex-col gap-[8px] items-center text-[#fcfcfc] text-center">
            <p className="font-['Literata',serif] font-extrabold text-[34px]" style={{ lineHeight: "36px" }}>Grid of Guilt</p>
            <p className="font-['Inter',sans-serif] font-normal text-[14px]" style={{ lineHeight: "19px" }}>Place the suspects. Find the murderer</p>
          </div>
        </div>

        {/* Level buttons */}
        <div className="flex flex-col gap-[12px] items-stretch w-full">
          {LEVEL_ORDER.map((id) => {
            const unlocked = isUnlocked(id, progress);
            const entry = progress[id];
            const solved = entry?.solved === true;
            const inProgress = !solved && hasLevelState(id);
            const locked = !unlocked;
            const lockMsg = lockMessage(id, progress);

            let statusEl: ReactNode = null;
            if (solved) {
              statusEl = (
                <span className="flex items-center gap-[6px] font-['Inter',sans-serif] font-semibold text-[13px] text-[#01394b]">
                  <CheckIcon />
                  {entry?.bestSeconds !== null && entry?.bestSeconds !== undefined ? formatTime(entry.bestSeconds) : ""}
                </span>
              );
            } else if (locked) {
              statusEl = (
                <span className="flex items-center gap-[6px] font-['Inter',sans-serif] font-normal text-[12px] text-[#678893]">
                  <LockIcon />
                  {lockMsg}
                </span>
              );
            } else if (inProgress) {
              statusEl = <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#678893]">In progress</span>;
            }

            return (
              <button
                key={id}
                onClick={() => handleLevelTap(id)}
                disabled={locked}
                aria-label={`${LEVEL_LABEL[id]} ${LEVEL_GRID[id]}×${LEVEL_GRID[id]}${locked ? `, locked, ${lockMsg}` : solved ? ", solved" : ""}`}
                className="w-full rounded-[16px] flex items-center justify-between px-[20px] cursor-pointer disabled:cursor-not-allowed border-none text-left"
                style={{
                  minHeight: 64,
                  backgroundColor: locked ? "#0a4a5e" : "#fcfcfc",
                  opacity: locked ? 0.7 : 1,
                }}
              >
                <span className="flex flex-col">
                  <span
                    className="font-['Literata',serif] font-extrabold text-[20px]"
                    style={{ color: locked ? "#678893" : "#191919", lineHeight: "24px" }}
                  >
                    {LEVEL_LABEL[id]}
                  </span>
                  <span
                    className="font-['Inter',sans-serif] font-normal text-[12px]"
                    style={{ color: locked ? "#678893" : "#678893", lineHeight: "16px" }}
                  >
                    {LEVEL_GRID[id]}×{LEVEL_GRID[id]} grid
                  </span>
                </span>
                {statusEl}
              </button>
            );
          })}
        </div>

        {/* How to play */}
        <button
          onClick={onHowToPlay}
          className="font-['Inter',sans-serif] font-semibold text-[14px] text-[#fcfcfc] underline bg-transparent border-none cursor-pointer p-0"
        >
          How to play
        </button>

        {debug && (
          <button
            onClick={onReset}
            className="font-['Inter',sans-serif] font-normal text-[12px] text-[#678893] underline bg-transparent border-none cursor-pointer p-0"
          >
            Reset progress (debug)
          </button>
        )}
      </div>

      {/* Solved-level sheet */}
      {sheetFor && (
        <div
          className="fixed inset-0 flex items-end justify-center"
          style={{ zIndex: 10002, backgroundColor: "rgba(1,24,31,0.6)" }}
          onClick={() => setSheetFor(null)}
        >
          <div
            className="bg-[#fcfcfc] w-full max-w-[500px] rounded-t-[20px] px-[24px] pt-[24px] pb-[32px] flex flex-col gap-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-['Literata',serif] font-extrabold text-[20px] text-[#191919]" style={{ lineHeight: "26px" }}>
              {LEVEL_LABEL[sheetFor]} solved
            </p>
            <p className="font-['Inter',sans-serif] font-normal text-[14px] text-[#191919]" style={{ lineHeight: "20px" }}>
              {progress[sheetFor]?.bestSeconds !== null && progress[sheetFor]?.bestSeconds !== undefined
                ? `You solved this in ${formatTime(progress[sheetFor]!.bestSeconds!)}.`
                : "You solved this."}
            </p>
            <div className="flex flex-col gap-[10px]">
              <button
                onClick={() => {
                  const id = sheetFor;
                  setSheetFor(null);
                  onReplay(id);
                }}
                className="w-full rounded-[50px] bg-[#01394b] text-[#fcfcfc] font-['Inter',sans-serif] font-semibold text-[15px] py-[12px] border-none cursor-pointer"
              >
                Replay
              </button>
              <button
                onClick={() => setSheetFor(null)}
                className="w-full rounded-[50px] bg-[#fcfcfc] text-[#191919] font-['Inter',sans-serif] font-semibold text-[15px] py-[12px] border border-[#678893] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
