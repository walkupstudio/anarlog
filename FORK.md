# Fork notes

Personal fork of fastrepl/anarlog adding a meetily-style transcript-first
structured summary pipeline. Spec and plan live in the sibling
`~/Meeting/docs/superpowers/` directory.

## New (fork-only) files

- `apps/desktop/src/summary/` — entire directory

## Modified upstream files

- apps/desktop/src/main/lifecycle.tsx                                        (template seeding, 1 line + import)
- apps/desktop/src/store/zustand/ai-task/task-configs/index.ts               (enhance arg types)
- apps/desktop/src/store/zustand/ai-task/task-configs/enhance-transform.ts   (sessionId/mode pass-through)
- apps/desktop/src/store/zustand/ai-task/task-configs/enhance-workflow.ts    (mode branch)
- apps/desktop/src/ai/task-window-sync.tsx                                   (mode in enhance payload)
- apps/desktop/src/services/enhancer/index.ts                                (mode in EnhanceOpts)
- apps/desktop/src/session/components/note-input/enhanced-actions.ts         (mode in onRegenerate)
- apps/desktop/src/session/components/note-input/header.tsx                  (context-menu item)

## Merging upstream

    git fetch upstream
    git merge upstream/main

Conflicts should only appear in the files listed above.

## Pre-existing baseline failures

(none observed)
