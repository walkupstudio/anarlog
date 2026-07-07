# Fork notes

Personal fork of fastrepl/anarlog adding a meetily-style transcript-first
structured summary pipeline. Spec and plan live in the sibling
`~/Meeting/docs/superpowers/` directory.

## New (fork-only) files

- `apps/desktop/src/summary/` — entire directory

## Modified upstream files

- `apps/desktop/src/main/lifecycle.tsx` — seeds fork templates on startup (1 line + import)

## Merging upstream

    git fetch upstream
    git merge upstream/main

Conflicts should only appear in the files listed above.

## Pre-existing baseline failures

(none observed)
