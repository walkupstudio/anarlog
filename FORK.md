# Fork notes

Personal fork of fastrepl/anarlog adding a meetily-style transcript-first
structured summary pipeline. Spec and plan live in the sibling
`~/Meeting/docs/superpowers/` directory.

## New (fork-only) files

- `apps/desktop/src/summary/` — entire directory
- `scripts/make-placeholder-icon.py`

## Modified upstream files

- apps/desktop/src/main/lifecycle.tsx                                        (template seeding, 1 line + import)
- apps/desktop/src/store/zustand/ai-task/task-configs/index.ts               (enhance arg types)
- apps/desktop/src/store/zustand/ai-task/task-configs/enhance-transform.ts   (sessionId/mode pass-through)
- apps/desktop/src/store/zustand/ai-task/task-configs/enhance-workflow.ts    (mode branch)
- apps/desktop/src/ai/task-window-sync.tsx                                   (mode in enhance payload)
- apps/desktop/src/services/enhancer/index.ts                                (mode in EnhanceOpts)
- apps/desktop/src/session/components/note-input/enhanced-actions.ts         (mode in onRegenerate)
- apps/desktop/src/session/components/note-input/header.tsx                  (context-menu item)
- crates/template-app/assets/chat.system.md.jinja                           (brand name in system prompt)
- crates/template-app-legacy/assets/chat.system.jinja                       (brand name in system prompt)
- crates/template-app/src/chat.rs                                           (inline snapshot text)
- crates/detect/src/list/mod.rs                                             (self-app bundle id/name/path entries)
- plugins/detect/src/policy.rs                                              (Hyprnote category bundle id)

## Phase A (Recap rebrand)

Following the rebrand initiative, the following additional files were modified in Tasks A1–A5:

- apps/desktop/src/onboarding/config.tsx                                     (LOCAL_ONLY fork flag)
- apps/desktop/src/onboarding/index.tsx                                      (LOCAL_ONLY fork flag)
- apps/desktop/src/sidebar/settings.tsx                                      (hide account nav item)
- apps/desktop/src/settings/ai/shared/hypr-cloud-button.tsx                 (hide cloud CTA button)
- apps/desktop/src/settings/ai/llm/select.tsx                                (filter pro provider)
- apps/desktop/src/settings/ai/stt/select.tsx                                (filter cloud model)
- apps/desktop/src/sidebar/toast/registry.tsx                                (hide pro/account upsell toasts)
- apps/desktop/src/calendar/components/sidebar.tsx                           (hide upgrade button)
- apps/desktop/src/sidebar/settings.test.tsx                                 (test updates)
- apps/desktop/src/sidebar/toast/registry.test.tsx                           (test updates)
- apps/desktop/src/sidebar/toast/index.test.tsx                              (test updates)
- scripts/rebrand.mjs                                                         (idempotent rebranding script)
- all display strings in apps/desktop/src/**/* via `node scripts/rebrand.mjs`
- apps/desktop/src-tauri/tauri.conf.json                                     (product name, identifier, icons)
- apps/desktop/src-tauri/icons/recap/                                        (56 placeholder icon files)
- plugins/analytics/src/lib.rs                                               (hard-disable PostHog)

**Identifier change:** `studio.walkup.recap` (formerly `com.hyprnote.dev`) — expects a fresh app-data directory on first launch; old dev data under the former identifier is abandoned.

## Amended merge policy

**Rust/core tracks upstream** — only `apps/desktop/src` + `packages/ui` are fork-owned; merge conflicts in core/plugin Rust are resolved upstream-first. **Display-string conflicts** → take upstream then re-run `node scripts/rebrand.mjs`; **restyled-screen conflicts** → resolve in Recap's favor.

## Merging upstream

    git fetch upstream
    git merge upstream/main

Conflicts are most likely in the files listed above, but the rebrand also touches
strings and identifiers scattered across `apps/desktop/src/**` (via `scripts/rebrand.mjs`)
and other places noted in "Known brand remnants" below — conflicts are not guaranteed
to be limited to this list.

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

## Known brand remnants (accepted)

- The old Anarlog logo PNG is still used as the provider icon (Phase B art; not
  yet replaced).
- `mainBinaryName` is still `anarlog-dev`.
- The `hyprnote` and `char` deep-link schemes are still registered alongside
  the fork's own scheme.
- The tray menu's version string still renders `(dev)`.

## Build requirements (macOS)

- Rust 1.94.0 via rustup (pinned by rust-toolchain.toml)
- pnpm 11 (installed at ~/.hermes/node/bin)
- **Full Xcode** (not just Command Line Tools): `crates/transcribe-soniqo` compiles Metal
  shaders with `xcrun metal`, which CLT does not provide. After installing Xcode:
  `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer && sudo xcodebuild -license accept`
