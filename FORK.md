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

## Behavioral dependencies

`~/summary/workflow.ts` reuses upstream enhance machinery rather than
reimplementing it, so it depends on the exact behavior of:

- `createEnhanceValidator`
  (`apps/desktop/src/store/zustand/ai-task/task-configs/enhance-validator.ts`)
  — the early-validation contract that the fork's `buildFinalSystemPrompt`
  output must satisfy (first streamed H1 fuzzy-matches the first template
  section title).
- `withEarlyValidationRetry`
  (`apps/desktop/src/store/zustand/ai-task/shared/validate.ts`) — the
  streaming/retry loop the workflow drives its `streamText` call through.
- `ensureMarkdownFirstLineTitle` / `enhance-success.ts`
  (`apps/desktop/src/store/zustand/ai-task/task-configs/enhance-success.ts`,
  `apps/desktop/src/session/title-content.ts`) — persists the session title
  as the markdown's first line at save time, which is why the structured
  summary prompt must NOT emit its own title heading.

Upstream drift in any of these can silently break the fork (wrong output
format, failed validation, duplicated titles) without producing a merge
conflict, since the fork only calls into them rather than modifying them.

## Known limitations

- The "Summarize from transcript" action lives on the enhanced-note header
  menu, so a session that has never been enhanced needs one regular
  enhance/auto-enhance pass first before the action is available.

## Build requirements (macOS)

- Rust 1.94.0 via rustup (pinned by rust-toolchain.toml)
- pnpm 11 (installed at ~/.hermes/node/bin)
- **Full Xcode** (not just Command Line Tools): `crates/transcribe-soniqo` compiles Metal
  shaders with `xcrun metal`, which CLT does not provide. After installing Xcode:
  `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer && sudo xcodebuild -license accept`
