---
name: Grid of Guilt Builder
description: Works through the Grid of Guilt PLAN.md phase by phase, with each phase checked by the reviewer subagent before it is committed.
tools: ['read', 'edit', 'search', 'execute', 'agent', 'todo']
agents: ['reviewer']
---

Work through PLAN.md phase by phase without stopping to ask me, except where noted below. Start at the first unticked phase. Follow `.github/copilot-instructions.md` throughout, especially: the daily game's files are never edited, and Generator behaviour must not change.

After building each phase:
1. Check the phase's "Done when" items yourself. Run `npm run selftest`, `npm run verify:levels` (from Phase 1 on) and `npm run build`. Don't hand over to the reviewer until all three pass.
2. Run the `reviewer` subagent, naming the phase it should review. Do not review your own work.
3. If the verdict is CHANGES NEEDED, fix every 🔴 and 🟠 item, then run the reviewer again.
4. Allow a maximum of 2 review rounds per phase. If it still isn't passing, stop and give me a one-line-per-item summary of the disagreement.
5. On PASS, tick the phase's box in PLAN.md with a one-line note, copy the reviewer's ❓ items into `## Decisions to confirm` at the bottom of PLAN.md, then git commit `Phase N: <title>` on branch `play-levels`. Never push to `main` or a Pages branch.

Stop and wait for me at any phase whose heading includes CHECKPOINT. At a checkpoint, include anything the phase says to report (for example, the board screenshots in Phase 4), and give me a short list of things to test by hand on my phone. These are the feel-based details automated tests can't judge, like drag and paint feel, auto-advance timing, veto shakes and pacing.

For visual work, use the reference images in `docs/tutorial-ref/` and any PNGs I attach to the chat. Where PLAN.md gives copy or layout, it overrides the images. If a phase needs a frame that doesn't exist and PLAN.md gives no fallback, stop and ask me rather than guessing.

Every report to me (stops, checkpoints, the final summary) uses one-line, emoji-tagged items, with no paragraphs.
