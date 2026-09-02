/**
 * Google Analytics event tracking for Grid of Guilt.
 *
 * Relies on the GA4 snippet already loaded via project settings.
 * All events use gtag('event', ...) which GA4 picks up automatically.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Initialize consent settings when the module loads
if (typeof window !== "undefined" && window.gtag) {
  window.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function track(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// ── Funnel & Progression ──────────────────────────────────

/** Fires when the start screen mounts (baseline) */
export function trackStartScreenViewed() {
  track("start_screen_viewed");
}

/** Fires when user clicks "Start Game" on the start screen */
export function trackTutorialStarted() {
  track("tutorial_started");
}

/** Fires when user clicks "Play tutorial" on the intro screen */
export function trackTutorialPlayClicked() {
  track("tutorial_play_clicked");
}

/** Fires when user clicks "Skip tutorial" on the intro screen */
export function trackTutorialSkippedIntro() {
  track("tutorial_skipped_intro");
}

/** Fires when user clicks "Skip" during the tutorial (on any step after intro) */
export function trackTutorialSkippedDuring(step: number) {
  track("tutorial_skipped_during", { step });
}

/** Fires when user advances to a new tutorial step (sends the max step reached) */
export function trackTutorialStepReached(step: number) {
  track("tutorial_step_reached", { step });
}

/** Fires when user completes all 8 tutorial steps */
export function trackTutorialCompleted(durationSeconds: number) {
  track("tutorial_completed", { duration_seconds: durationSeconds });
}

/** Fires when the flashlight animation finishes and the timer starts */
export function trackPuzzleStarted() {
  track("puzzle_started");
}

/** Fires when all suspects are correctly placed */
export function trackPuzzleCompleted(params: {
  completion_time_seconds: number;
  undo_count: number;
  hint_count: number;
  placement_error_count: number;
  rule_violation_count: number;
}) {
  track("puzzle_completed", params);
}

// ── Performance & Difficulty ──────────────────────────────

/** Fires each time the user clicks Undo */
export function trackUndoUsed(totalUndoCount: number) {
  track("undo_used", { total_undo_count: totalUndoCount });
}

/** Fires each time a placement error is detected (row/col/adjacent conflict) */
export function trackPlacementError(totalCount: number) {
  track("placement_error", { total_placement_errors: totalCount });
}

/** Fires each time a rule violation is detected */
export function trackRuleViolation(totalCount: number) {
  track("rule_violation", { total_rule_violations: totalCount });
}

/** Fires each time the user requests a hint */
export function trackHintUsed(totalHintCount: number) {
  track("hint_used", { total_hint_count: totalHintCount });
}

// ── Feature Usage ─────────────────────────────────────────

/** Fires when the "How to Play" modal is opened */
export function trackHowToPlayOpened(context: "early_game" | "during_game") {
  track("how_to_play_opened", { context });
}

// ── End Screen ────────────────────────────────────────────

/** Fires when the user clicks the feedback/Google Form link */
export function trackFeedbackLinkClicked() {
  track("feedback_link_clicked");
}

/** Fires when the user clicks the back button on the end screen */
export function trackBackButtonClicked() {
  track("back_button_clicked");
}