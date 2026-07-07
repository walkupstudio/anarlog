# Fork notes

Personal fork of fastrepl/anarlog adding a meetily-style transcript-first
structured summary pipeline. Spec and plan live in the sibling
`~/Meeting/docs/superpowers/` directory.

## New (fork-only) files

- `apps/desktop/src/summary/` — entire directory

## Modified upstream files

- `apps/desktop/src/main/lifecycle.tsx` — seeds fork templates on startup (1 line + import)
- `apps/desktop/src/store/zustand/ai-task/task-configs/index.ts` — enhance arg types gain `mode`/`sessionId`
- `apps/desktop/src/store/zustand/ai-task/task-configs/enhance-transform.ts` — passes `sessionId`/`mode` through
- `apps/desktop/src/store/zustand/ai-task/task-configs/enhance-workflow.ts` — 4-line branch into `~/summary/workflow`
- `apps/desktop/src/ai/task-window-sync.tsx` — `TaskEnhancePayload.opts` gains `mode`
- `apps/desktop/src/services/enhancer/index.ts` — `EnhanceOpts` gains `mode`, forwarded into generate args
- `apps/desktop/src/session/components/note-input/enhanced-actions.ts` — `onRegenerate` takes an `opts.mode` param, threaded through both dispatch paths
- `apps/desktop/src/session/components/note-input/header.tsx` — adds "Summarize from transcript" context-menu item to `HeaderViewEnhancedActive`

## Merging upstream

    git fetch upstream
    git merge upstream/main

Conflicts should only appear in the files listed above.

## Pre-existing baseline failures

(none observed)
