// Grid of Guilt — /play/ root. Holds the screen state machine (no router) and
// the How to Play overlay, owns the loaded progress, and wires the landing
// screen to level play. The tutorial, level player and results screens are
// filled in by later phases; here they are minimal placeholders so navigation
// and the build are exercised end to end.

import { useState, useCallback } from "react";
import type { LevelId } from "../app/levels/loadLevel";
import LandingScreen from "./LandingScreen";
import {
  loadProgress,
  getTutorialSeen,
  clearLevelState,
  resetAllProgress,
  LEVEL_LABEL,
  type ProgressMap,
} from "./storage";

type Screen = "landing" | "tutorial" | "level" | "results";

function hasDebugFlag(): boolean {
  try {
    return new URLSearchParams(window.location.search).has("debug");
  } catch {
    return false;
  }
}

// Temporary placeholder shared by the not-yet-built screens (Phases 4–6). Keeps
// the state machine honest without pre-empting later design work.
function Placeholder({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="bg-[#01394b] fixed inset-0 flex flex-col items-center justify-center gap-[20px] px-[24px]" style={{ zIndex: 10001 }}>
      <p className="font-['Literata',serif] font-extrabold text-[24px] text-[#fcfcfc] text-center">{title}</p>
      <p className="font-['Inter',sans-serif] font-normal text-[14px] text-[#9fb6bd] text-center">Coming in a later phase.</p>
      <button
        onClick={onBack}
        className="rounded-[50px] bg-[#fcfcfc] text-[#191919] font-['Inter',sans-serif] font-semibold text-[15px] px-[24px] py-[12px] border-none cursor-pointer"
      >
        Back
      </button>
    </div>
  );
}

export default function LevelsApp() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [activeLevel, setActiveLevel] = useState<LevelId | null>(null);
  const [howToPlay, setHowToPlay] = useState(false);
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const debug = hasDebugFlag();

  const refreshProgress = useCallback(() => setProgress(loadProgress()), []);

  // Start a level. First-timers see the tutorial first; afterwards they go
  // straight into the board.
  const handlePlay = useCallback((id: LevelId) => {
    setActiveLevel(id);
    setScreen(getTutorialSeen() ? "level" : "tutorial");
  }, []);

  // Replay a solved level: wipe only its in-progress board (best time is kept
  // in progress) and start fresh on the board.
  const handleReplay = useCallback((id: LevelId) => {
    clearLevelState(id);
    refreshProgress();
    setActiveLevel(id);
    setScreen("level");
  }, [refreshProgress]);

  const handleBackToLanding = useCallback(() => {
    refreshProgress();
    setActiveLevel(null);
    setScreen("landing");
  }, [refreshProgress]);

  const handleReset = useCallback(() => {
    resetAllProgress();
    try {
      window.location.reload();
    } catch {
      refreshProgress();
    }
  }, [refreshProgress]);

  if (screen === "tutorial") {
    return <Placeholder title="Tutorial" onBack={handleBackToLanding} />;
  }
  if (screen === "level" && activeLevel) {
    return <Placeholder title={`${LEVEL_LABEL[activeLevel]} level`} onBack={handleBackToLanding} />;
  }
  if (screen === "results" && activeLevel) {
    return <Placeholder title="Results" onBack={handleBackToLanding} />;
  }

  return (
    <>
      <LandingScreen
        progress={progress}
        debug={debug}
        onPlay={handlePlay}
        onReplay={handleReplay}
        onHowToPlay={() => setHowToPlay(true)}
        onReset={handleReset}
      />
      {howToPlay && (
        <div className="fixed inset-0 flex items-center justify-center px-[24px]" style={{ zIndex: 10003, backgroundColor: "rgba(1,24,31,0.8)" }}>
          <div className="bg-[#fcfcfc] w-full max-w-[420px] rounded-[20px] px-[24px] py-[28px] flex flex-col gap-[16px]">
            <p className="font-['Literata',serif] font-extrabold text-[22px] text-[#191919]">How to play</p>
            <p className="font-['Inter',sans-serif] font-normal text-[14px] text-[#191919]" style={{ lineHeight: "20px" }}>
              Place one suspect per row, column and room, with no two suspects touching — not even diagonally.
              Every suspect's clue must be true. The murderer is whoever ends up in the same room as the body.
            </p>
            <button
              onClick={() => setHowToPlay(false)}
              className="self-end rounded-[50px] bg-[#01394b] text-[#fcfcfc] font-['Inter',sans-serif] font-semibold text-[15px] px-[24px] py-[10px] border-none cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
