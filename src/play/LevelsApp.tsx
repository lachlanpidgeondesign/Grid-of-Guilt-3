// Grid of Guilt — /play/ root. Holds the screen state machine (no router) and
// the How to Play overlay, owns the loaded progress, and wires the landing
// screen to level play. The tutorial, level player and results screens are
// filled in by later phases; here they are minimal placeholders so navigation
// and the build are exercised end to end.

import { useState, useCallback } from "react";
import type { LevelId } from "../app/levels/loadLevel";
import LandingScreen from "./LandingScreen";
import LevelPlayer, { type SolveResult } from "./LevelPlayer";
import ResultsScreen from "./ResultsScreen";
import TutorialScreen from "./TutorialScreen";
import {
  loadProgress,
  getTutorialSeen,
  setTutorialSeen,
  clearLevelState,
  resetAllProgress,
  formatTime,
  LEVEL_LABEL,
  LEVEL_ORDER,
  type ProgressMap,
} from "./storage";
import { playUrl, shareOrCopy } from "./share";

type Screen = "landing" | "tutorial" | "level" | "results";

function hasDebugFlag(): boolean {
  try {
    return new URLSearchParams(window.location.search).has("debug");
  } catch {
    return false;
  }
}

// Debug deep-link (QA/screenshots): with `?debug` present, `?open=easy|medium|
// hard` opens that level's board directly, bypassing the tutorial gate, and
// `?open=tutorial` opens the tutorial. Ignored in a normal production URL and
// for any other value.
function debugOpenLevel(): LevelId | null {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("debug")) return null;
    const v = params.get("open");
    return v === "easy" || v === "medium" || v === "hard" ? v : null;
  } catch {
    return null;
  }
}

function debugOpenTutorial(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has("debug") && params.get("open") === "tutorial";
  } catch {
    return false;
  }
}

// Finish the tutorial (Skip or Start game): remember it was seen and go straight
// into the level the player tapped.

export default function LevelsApp() {
  const [screen, setScreen] = useState<Screen>(() => (debugOpenTutorial() ? "tutorial" : debugOpenLevel() ? "level" : "landing"));
  const [activeLevel, setActiveLevel] = useState<LevelId | null>(() => (debugOpenTutorial() ? "easy" : debugOpenLevel()));
  const [lastResult, setLastResult] = useState<SolveResult | null>(null);
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

  const handleSolved = useCallback((result: SolveResult) => {
    // LevelPlayer already recorded the solve and cleared the saved board before
    // handing over; here we just refresh the landing data and show the results.
    refreshProgress();
    setLastResult(result);
    setScreen("results");
  }, [refreshProgress]);

  const handleNextLevel = useCallback(() => {
    if (!lastResult) return;
    const nextIdx = LEVEL_ORDER.indexOf(lastResult.levelId) + 1;
    if (nextIdx >= LEVEL_ORDER.length) { handleBackToLanding(); return; }
    // Resume the next level if it has an in-progress save; otherwise it starts
    // fresh. (Don't wipe a save the player may already have there.)
    setActiveLevel(LEVEL_ORDER[nextIdx]);
    setScreen("level");
  }, [lastResult, handleBackToLanding]);

  const handleResultsShare = useCallback(async () => {
    if (!lastResult) return;
    const text = `I caught the murderer on Grid of Guilt ${LEVEL_LABEL[lastResult.levelId]} in ${formatTime(lastResult.seconds)}`;
    await shareOrCopy(text, playUrl());
  }, [lastResult]);

  const handleReset = useCallback(() => {
    resetAllProgress();
    try {
      window.location.reload();
    } catch {
      refreshProgress();
    }
  }, [refreshProgress]);

  const handleSkipTutorial = useCallback(() => {
    setTutorialSeen(true);
    setScreen("level");
  }, []);

  if (screen === "tutorial" && activeLevel) {
    return <TutorialScreen onFinish={handleSkipTutorial} />;
  }
  if (screen === "level" && activeLevel) {
    return (
      <LevelPlayer
        key={activeLevel}
        levelId={activeLevel}
        onBackToLanding={handleBackToLanding}
        onSolved={handleSolved}
        onHowToPlay={() => setHowToPlay(true)}
      />
    );
  }
  if (screen === "results" && lastResult) {
    return (
      <ResultsScreen
        levelId={lastResult.levelId}
        seconds={lastResult.seconds}
        hints={lastResult.hints}
        onNextLevel={handleNextLevel}
        onBackToLevels={handleBackToLanding}
        onShare={handleResultsShare}
      />
    );
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
