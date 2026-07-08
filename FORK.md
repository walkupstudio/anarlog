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

## Phase B (design foundation)

New fork-only files: `packages/ui/src/styles/recap-tokens.css` (palette; must stay the LAST @import in both globals.css files), `apps/desktop/src/styles/recap-fonts.css` + `apps/desktop/public/fonts/recap/` (bundled Space Grotesk/Inter/JetBrains Mono, OFL licenses), `apps/desktop/src/fork/wordmark.tsx`, `scripts/make-recap-icon.py` (superseded by `scripts/render-app-icon.swift` + committed source `apps/desktop/src-tauri/icons/recap-source.png` — the R-monogram icon; the swift header documents the TTF fetch), `apps/desktop/src/fork/recap-tokens.test.ts`, `apps/desktop/src/fork/wordmark.test.tsx`.

Modified upstream files: `packages/ui/src/styles/globals.css` (+1 import), `apps/desktop/src/styles/globals.css` (font tokens + 2 imports), `apps/desktop/src/shared/theme/apply.ts` + `apps/desktop/public/theme-boot.js` (dark default), `apps/desktop/src/onboarding/shared.tsx` (chapter prop), `apps/desktop/src/onboarding/index.tsx` (wordmark header, chapter numbers), `apps/desktop/src-tauri/icons/recap/*` (regenerated art), theme test files.

Merge rule: token VALUES are fork-owned via recap-tokens.css — on upstream merge, take upstream's globals.css and re-append the recap-tokens import last; never rename tokens.

## Phase C (editor typography + chapters motif)

### Task C1: editor typography retoken + chapters motif

Modified upstream files: `packages/editor/src/styles/prosemirror.css` (placeholder color), `packages/editor/src/styles/prosemirror/base.css` (caret color), `packages/editor/src/styles/prosemirror/dark.css` (shrunk to a single genuinely dark-specific rule — the mention dropdown's inset-ring box-shadow — now that colors flow through tokens), `packages/editor/src/styles/prosemirror/mention.css` (dropdown surface/hover/icon colors), `packages/editor/src/styles/prosemirror/nodes/heading.css` (heading color + `font-family: var(--font-display)`, chapters-motif counter CSS), `packages/editor/src/styles/prosemirror/nodes/blockquote.css`, `packages/editor/src/styles/prosemirror/nodes/link.css` (link color + hover via `--recap-blue-hover`), `packages/editor/src/styles/prosemirror/nodes/code.css` (code block/inline code colors + `var(--font-mono)`), `packages/editor/src/styles/prosemirror/nodes/mark.css`, `packages/editor/src/styles/prosemirror/nodes/search.css` (yellow/orange highlight → primary-tinted), `packages/editor/src/styles/prosemirror/nodes/task-list.css` (checkbox border/fill/ring), `packages/editor/src/styles/prosemirror/nodes/hashtag.css` (amber → primary), `packages/editor/src/styles/prosemirror/nodes/table.css` (border/header bg/selection/resize-handle colors + `var(--font-mono)` on cells).

Test file extended (not new): `apps/desktop/src/fork/recap-tokens.test.ts` (added a guard test that walks `packages/editor/src/styles/**/*.css` and fails on any `#hex` literal; empty allowlist for now).

Chapters-motif note: the brief's proposed `.enhanced-summary-editor .ProseMirror > h1` selector assumed `.ProseMirror` was a descendant of the editor's className. It isn't — `prosemirror-view`'s `computeDocDeco` appends the app's `attributes.class` directly onto the same contentDOM node that already carries the `ProseMirror` class (see `node_modules/prosemirror-view/dist/index.js`, `computeDocDeco`), so the actual selector is the compound `.ProseMirror.enhanced-summary-editor > h1`. Additionally, `title-layout.ts`'s `normalizeTitleHeadingDoc` always coerces the enhanced note's first block into an h1 (the session title), so the counter uses `> h1:not(:first-child)` to avoid numbering the title as "chapter 01".

### Task C2: note-input header + transcript panel retokening

Modified upstream files: `apps/desktop/src/session/components/note-input/header.tsx` (active view-switcher pill `bg-white`/`shadow-xs` → `bg-card`/`border-border` hairline in both the grouped-switcher and standalone variants; focus-visible `bg-white` → `bg-card`; live-transcript dot literals `#f59e0b`/`#ef4444` → `currentColor` via a `text-primary` wrapper span), `apps/desktop/src/session/components/note-input/header.test.tsx` (assertions updated from `bg-white`/`shadow-xs` to `bg-card`/`border-border`, `not.toContain("shadow-xs")`), `apps/desktop/src/session/components/note-input/transcript/screens/batch.tsx` (`color="#a3a3a3"` → `currentColor` under a `text-muted-foreground` wrapper), `apps/desktop/src/session/components/note-input/transcript/renderer/segment-header.tsx` (sticky header gains `border-b border-border`; speaker-label trigger gets `font-mono tracking-wide` via a new `className` pass-through, existing `text-xs` size kept since it's already in the 11-12px range), `apps/desktop/src/session/components/note-input/transcript/renderer/segment.tsx` (current-line highlight `bg-yellow-100/50 dark:bg-yellow-900/30` → `bg-primary/10 dark:bg-primary/20`), `apps/desktop/src/session/components/note-input/transcript/renderer/word-span.tsx` (search-match highlight: active match `bg-yellow-500` → `bg-primary/25 text-foreground`, other matches `bg-yellow-200/50` → `bg-primary/10 text-foreground` — kept the two-tier active/other distinction using only the two opacities named in the C-2 spec bullet), `apps/desktop/src/session/components/note-input/transcript/index.tsx` (`FinalizingTranscriptBanner` drops `shadow-sm`, keeps its existing `border` which already resolves to `border-border` via the global base-layer default), `packages/ui/src/components/ui/dancing-sticks.tsx` (default `color` prop `#e5e5e5` → `currentColor` — all three call sites (`header.tsx`, `batch.tsx`, `sidebar/timeline/item.tsx`) now agree on passing `currentColor` explicitly).

`DancingSticks` note: `sidebar/timeline/item.tsx` already passed `color="currentColor"` under a `text-white/80` button (out of scope for C-2, untouched). With `header.tsx` and `batch.tsx` now doing the same, all known call sites agree, so the component default was updated too.

Review fix (same task): the active-live pill branches in `header.tsx` (`bg-amber-50 text-amber-500 ...` degraded, `bg-red-50 text-red-500 ...` normal-live, plus their dark variants) → `bg-primary/10 text-primary hover:bg-primary/15`, with the degraded branch dimming to `text-primary/60` (color was its only cue; still color-only — a structural degraded affordance would be a behavioral change). The enhanced tab's `isError` red branch is a genuine error state and stays red. The `canResume` red hover preview + red ping resume dot were not adjudicated; left for Phase D.

### Task C3: timeline sidebar restyle

Modified upstream files: `apps/desktop/src/sidebar/timeline/index.tsx` (bucket date labels `text-base font-bold` → chapters-voice mono micro-label `font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground`; sticky bucket-header bar gains `border-b border-border` hairline; `TimelineTopChip` drops `shadow-xs` and `TimelineNowChip` drops `shadow-md` — both already carry a `border` hairline; scroll-fade mask literal `#000` → `black` keyword), `apps/desktop/src/sidebar/timeline/item.tsx` (live-stop button on `bg-destructive`: `text-white/80 hover:bg-white/15 hover:text-white` + `ring-white/70` → `text-destructive-foreground/80 hover:bg-destructive-foreground/15 hover:text-destructive-foreground` + `ring-destructive-foreground/70`), `apps/desktop/src/sidebar/timeline/realtime.tsx` (`CurrentTimeIndicator` label pill: `text-white`/`dark:text-white` → `text-destructive-foreground`, `shadow-xs` dropped — the solid pill with its existing border needs no shadow for separation), `apps/desktop/src/sidebar/timeline/index.test.tsx`, `apps/desktop/src/sidebar/timeline/item.test.tsx`, `apps/desktop/src/sidebar/timeline/realtime.test.tsx` (assertions updated to the new classes).

**Controller ruling (post-review):** the timeline "now" line/label and live time text use `--primary` blue — live/current states own blue; the live-stop button stays destructive red because stopping is a destructive action. Applied in `realtime.tsx` (line + label pill → `bg-primary`/`text-primary-foreground`) and `item.tsx` (live time text → `text-primary/75`).

**Physical-color exception:** the timeline scroll-fade mask (`getTimelineScrollFadeMask` in `sidebar/timeline/index.tsx`) uses the `black` keyword. Mask-image colors are alpha ramps — only the alpha channel matters, they are not theme colors — so this is a documented exception to the no-hardcoded-color rule.

### Task C4: Floating action button retoken

Modified upstream files: `apps/desktop/src/shared/floating-action-surface.ts` (replaced bespoke rgba-shadow glassmorphism with token-based system: `border border-app-floating-border bg-app-floating-panel/95 text-foreground backdrop-blur-md hover:bg-app-floating-panel` — removed all inset/drop shadows), `apps/desktop/src/shared/floating-action-surface.test.ts` (assertions updated to verify new token classes and absence of shadow utilities).

Consumers verified: `apps/desktop/src/session/components/floating/shared.tsx` (`FloatingButton` applies the class to the Button element; hover state and visual hierarchy maintained by the new tokens). All call sites render sanely; no conflicting bg/text classes layered on top.

Primary variant (review fix): `floating-action-surface.ts` also exports `floatingActionPrimarySurfaceClassName` (`border-transparent bg-primary text-primary-foreground hover:bg-primary/90`); `apps/desktop/src/session/components/listen-action.tsx` layers it via `FloatingButton`'s className pass-through (twMerge resolves the overrides) on the Listen start button and its loading/stop spinner state — only the Listen action goes blue; other floating actions keep the panel surface. New test: `apps/desktop/src/session/components/listen-action.test.tsx`.

### Task C5: Stray neutrals in chrome

Modified upstream files: `apps/desktop/src/session/components/title-breadcrumb.tsx` (nav and folder-crumb labels `text-neutral-700`/`text-neutral-600` → `text-muted-foreground`; these are secondary breadcrumb labels), `apps/desktop/src/session/components/title-input.tsx` (breadcrumb variant input `text-neutral-700` → `text-foreground`; this is primary content), `apps/desktop/src/main/update-banner.tsx` (`SidebarTimelineUpdateButton` on `bg-blue-500` with `text-white shadow-sm` and hover `bg-blue-600` → token-based `bg-primary text-primary-foreground hover:bg-primary/90` — shadow removed per no-shadow rule).

Test file updated: `apps/desktop/src/main/update-banner.test.tsx` (assertion changed from expecting `bg-blue-500 hover:bg-blue-600` to `bg-primary hover:bg-primary/90`).

### Task D1: settings heading system

New fork-only file: `apps/desktop/src/settings/section-label.tsx` (`SettingsSectionLabel` — mono micro-label h2: `font-mono text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground`, matching the timeline/onboarding chapters voice). Modified upstream files (secondary `text-lg font-semibold` h2 → `SettingsSectionLabel`, wrapper margins adjusted mb-2/mb-4 → mb-3 where needed): `apps/desktop/src/settings/personalization/index.tsx`, `settings/general/account.tsx` (×2), `settings/general/index.tsx`, `settings/general/storage/index.tsx`, `settings/general/app-settings.tsx`. `SettingsPageTitle` untouched.

### Phase C/D backlog (from Phase B review)

- RecordingIcon renders a red dot on the now-blue Listen button — needs a Phase D color decision (blue-on-blue prevents the naive C-2 rule).
- Composer: 10px eyebrow at /38 (3.31:1) and editor placeholder at /28 (2.34:1) are sub-AA on the dark panel; revisit in the Phase D contrast sweep.
- Composer send button is an off-white circle with blue arrow; consider `bg-primary` per "blue = primary actions" (Phase C call).

- Dedupe committed font woff2 duplicates via variable-font weight-range descriptors.
- Keep body-size `text-primary` text out of new screens (3.5:1 on card).
- Stone-tinted drop shadows in `settings/general/account.tsx` + `calendar/components/sidebar.tsx` violate the no-shadow rule (Phase D sweep).
- macOS icon-services cache can show a stale icon during dev (`rm -rf ~/Library/Caches/com.apple.iconservices*; killall Dock`).
