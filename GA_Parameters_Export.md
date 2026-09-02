# Google Analytics Parameters - Grid of Guilt

## Event: start_screen_viewed
**Description:** Fires when the start screen mounts (baseline funnel metric)
- No custom parameters

---

## Event: tutorial_started
**Description:** Fires when user clicks "Start Game" on the start screen
- No custom parameters

---

## Event: tutorial_play_clicked
**Description:** Fires when user clicks "Play tutorial" on the intro screen
- No custom parameters

---

## Event: tutorial_skipped_intro
**Description:** Fires when user clicks "Skip tutorial" on the intro screen
- No custom parameters

---

## Event: tutorial_skipped_during
**Description:** Fires when user clicks "Skip" during the tutorial (on any step after intro)

| Parameter Name | Type | Scope | Sample Value | Description |
|---------------|------|-------|--------------|-------------|
| step | Dimension (Integer) | Event | `3` | The tutorial step number where user skipped (1-8) |

---

## Event: tutorial_step_reached
**Description:** Fires when user advances to a new tutorial step (sends the max step reached)

| Parameter Name | Type | Scope | Sample Value | Description |
|---------------|------|-------|--------------|-------------|
| step | Dimension (Integer) | Event | `5` | The tutorial step number reached (1-8) |

---

## Event: tutorial_completed
**Description:** Fires when user completes all 8 tutorial steps

| Parameter Name | Type | Scope | Sample Value | Description |
|---------------|------|-------|--------------|-------------|
| duration_seconds | Metric (Integer) | Event | `127` | Time spent in tutorial in seconds |

---

## Event: puzzle_started
**Description:** Fires when the flashlight animation finishes and the timer starts
- No custom parameters

---

## Event: puzzle_completed
**Description:** Fires when all suspects are correctly placed

| Parameter Name | Type | Scope | Sample Value | Description |
|---------------|------|-------|--------------|-------------|
| completion_time_seconds | Metric (Integer) | Event | `342` | Total time to complete puzzle in seconds |
| undo_count | Metric (Integer) | Event | `7` | Total number of undos used |
| hint_count | Metric (Integer) | Event | `3` | Total number of hints used |
| placement_error_count | Metric (Integer) | Event | `12` | Total placement errors triggered |
| rule_violation_count | Metric (Integer) | Event | `5` | Total rule violations triggered |

---

## Event: undo_used
**Description:** Fires each time the user clicks Undo

| Parameter Name | Type | Scope | Sample Value | Description |
|---------------|------|-------|--------------|-------------|
| total_undo_count | Metric (Integer) | Event | `4` | Running count of undos used in current game |

---

## Event: placement_error
**Description:** Fires each time a placement error is detected (row/col/adjacent conflict)

| Parameter Name | Type | Scope | Sample Value | Description |
|---------------|------|-------|--------------|-------------|
| total_placement_errors | Metric (Integer) | Event | `8` | Running count of placement errors in current game |

---

## Event: rule_violation
**Description:** Fires each time a rule violation is detected

| Parameter Name | Type | Scope | Sample Value | Description |
|---------------|------|-------|--------------|-------------|
| total_rule_violations | Metric (Integer) | Event | `3` | Running count of rule violations in current game |

---

## Event: hint_used
**Description:** Fires each time the user requests a hint

| Parameter Name | Type | Scope | Sample Value | Description |
|---------------|------|-------|--------------|-------------|
| total_hint_count | Metric (Integer) | Event | `2` | Running count of hints used in current game |

---

## Event: how_to_play_opened
**Description:** Fires when the "How to Play" modal is opened

| Parameter Name | Type | Scope | Sample Value | Description |
|---------------|------|-------|--------------|-------------|
| context | Dimension (String) | Event | `"early_game"` or `"during_game"` | When modal was opened (early = timer ≤ 10s) |

---

## Event: feedback_link_clicked
**Description:** Fires when the user clicks the feedback/Google Form link
- No custom parameters

---

## Event: back_button_clicked
**Description:** Fires when the user clicks the back button on the end screen
- No custom parameters

---

## Summary Statistics

### Total Events: 15

### Events by Category:

**Funnel & Progression (8 events):**
- start_screen_viewed
- tutorial_started
- tutorial_play_clicked
- tutorial_skipped_intro
- tutorial_skipped_during
- tutorial_step_reached
- tutorial_completed
- puzzle_started

**Performance & Difficulty (5 events):**
- puzzle_completed
- undo_used
- placement_error
- rule_violation
- hint_used

**Feature Usage (1 event):**
- how_to_play_opened

**End Screen (2 events):**
- feedback_link_clicked
- back_button_clicked

---

## Custom Parameters Summary

### All Unique Parameters (10 total):

| Parameter Name | Type | Scope | Used In Events | Sample Values |
|---------------|------|-------|----------------|---------------|
| step | Dimension (Integer) | Event | tutorial_skipped_during, tutorial_step_reached | 1, 2, 3, 4, 5, 6, 7, 8 |
| duration_seconds | Metric (Integer) | Event | tutorial_completed | 45, 127, 203 |
| completion_time_seconds | Metric (Integer) | Event | puzzle_completed | 180, 342, 567 |
| undo_count | Metric (Integer) | Event | puzzle_completed | 0, 7, 15 |
| hint_count | Metric (Integer) | Event | puzzle_completed | 0, 3, 8 |
| placement_error_count | Metric (Integer) | Event | puzzle_completed | 0, 12, 25 |
| rule_violation_count | Metric (Integer) | Event | puzzle_completed | 0, 5, 10 |
| total_undo_count | Metric (Integer) | Event | undo_used | 1, 2, 3, 4... |
| total_placement_errors | Metric (Integer) | Event | placement_error | 1, 2, 3, 4... |
| total_rule_violations | Metric (Integer) | Event | rule_violation | 1, 2, 3, 4... |
| total_hint_count | Metric (Integer) | Event | hint_used | 1, 2, 3, 4... |
| context | Dimension (String) | Event | how_to_play_opened | "early_game", "during_game" |

---

## GA4 Configuration Notes

### Custom Dimensions to Register:
1. **step** - Integer dimension for tutorial progress tracking
2. **context** - String dimension for feature usage context

### Custom Metrics to Register:
1. **duration_seconds** - Time spent in tutorial
2. **completion_time_seconds** - Time to complete puzzle
3. **undo_count** - Total undos at puzzle completion
4. **hint_count** - Total hints at puzzle completion
5. **placement_error_count** - Total placement errors at puzzle completion
6. **rule_violation_count** - Total rule violations at puzzle completion
7. **total_undo_count** - Running undo count
8. **total_placement_errors** - Running placement error count
9. **total_rule_violations** - Running rule violation count
10. **total_hint_count** - Running hint count

### Scope Details:
- **Event scope**: All parameters are event-scoped, meaning they apply only to the specific event they're sent with
- **No user-scoped parameters**: The app doesn't track cross-session user properties
- **No session-scoped parameters**: Each play-through is independent
