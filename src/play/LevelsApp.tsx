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
import HowToPlayScreen from "./HowToPlayScreen";
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

function debugOpenHowTo(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has("debug") && params.get("open") === "howto";
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
  const [howToPlay, setHowToPlay] = useState(() => debugOpenHowTo());
  const [replayTutorial, setReplayTutorial] = useState(false);
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

  // Replay tutorial (from the How to Play screen): close How to Play and run the
  // tutorial as an overlay. The underlying screen (landing or the in-progress
  // level) stays mounted, so finishing returns to exactly where it was opened;
  // the level's timer is frozen via `suspended` while an overlay covers it.
  const handleReplayTutorial = useCallback(() => {
    setHowToPlay(false);
    setReplayTutorial(true);
  }, []);

  // The base screen (landing / tutorial / level / results). How to Play and
  // Replay tutorial render as overlays on top of it.
  let base: React.ReactNode;
  if (screen === "tutorial" && activeLevel) {
    base = <TutorialScreen onFinish={handleSkipTutorial} />;
  } else if (screen === "level" && activeLevel) {
    base = (
      <LevelPlayer
        key={activeLevel}
        levelId={activeLevel}
        onBackToLanding={handleBackToLanding}
        onSolved={handleSolved}
        onHowToPlay={() => setHowToPlay(true)}
        suspended={howToPlay || replayTutorial}
      />
    );
  } else if (screen === "results" && lastResult) {
    base = (
      <ResultsScreen
        levelId={lastResult.levelId}
        seconds={lastResult.seconds}
        hints={lastResult.hints}
        onNextLevel={handleNextLevel}
        onBackToLevels={handleBackToLanding}
        onShare={handleResultsShare}
      />
    );
  } else {
    base = (
      <LandingScreen
        progress={progress}
        debug={debug}
        onPlay={handlePlay}
        onReplay={handleReplay}
        onHowToPlay={() => setHowToPlay(true)}
        onReset={handleReset}
      />
    );
  }

  return (
    <>
      {base}
      {howToPlay && (
        <HowToPlayScreen
          onClose={() => setHowToPlay(false)}
          onReplayTutorial={handleReplayTutorial}
        />
      )}
      {replayTutorial && <TutorialScreen onFinish={() => setReplayTutorial(false)} />}
    </>
  );
}
