---
name: no-comments
description: Remove code comments that explain or defend Remotion's own code, keeping only comments about external systems we cannot change (browser quirks, codec/FFmpeg behavior, third-party APIs, OS or platform bugs). Use when the user invokes /no-comments or asks to strip unnecessary comments from a diff or files.
disable-model-invocation: true
---

# No comments

Delete comments that describe our own code. Code we own should explain itself
through names, types, and structure. Keep a comment only when it documents
something outside our control that a reader could not learn from our code.

## Scope

Use the files or diff the user named. Otherwise use the current diff against
`main`, including staged, unstaged, and untracked changes:

```bash
git diff main...HEAD
git diff HEAD
git ls-files --others --exclude-standard
```

Only touch comments on lines added or modified in scope. Do not sweep untouched
code in the same file.

## Keep

A comment stays only if it is about an external system and is still accurate:

- Browser behavior: Chrome/Safari/Firefox quirks, WebCodecs, Canvas, CSS,
  layout, event ordering, autoplay policy, linked bug trackers.
- Media and tooling: FFmpeg, codecs, containers, Mediabunny, Chromium flags,
  Lambda/Cloud Run limits, Node.js, Bun, TypeScript compiler, bundler behavior.
- Third-party libraries and APIs: why we call them in an unusual way, links to
  upstream issues.
- OS, hardware, and spec constraints: file system, GPU, Linux/macOS/Windows
  differences, RFCs, W3C specs.

Also keep:

- Machine-read directives: `eslint-disable*`, `@ts-expect-error`,
  `@ts-ignore`, `/// <reference>`, `'use client'`, `istanbul ignore`,
  `prettier-ignore`, `biome-ignore`, `@vitest-environment`, shebangs, license
  headers. Still check that each suppression is needed; remove dead ones.
- JSDoc on public exported APIs (it surfaces in editor tooltips).
- `@deprecated` tags (see the `deprecate-api` skill).
- Comments in docs, MDX, and code snippets that are shown to users.

## Delete

- Narration of what the next lines do (`// Get the frame`, `// Loop over tracks`).
- Restating names, types, or parameters.
- Explanations of our own architecture, data flow, or design choices.
- Defenses of workarounds for our own bugs. Fix the root cause in scope or
  leave the code uncommented.
- `IMPORTANT`, `do not remove`, `keep in sync with X`, `talk to Y first` notes
  about our own code. If the constraint is real, offer to encode it (type,
  shared constant, test, lint) instead; delete the comment either way.
- Commented-out code, `TODO`/`FIXME` without a linked issue, changelog-style
  notes (`// Added in v4.0.x`), and section dividers.

Mixed comments: keep only the external-system sentence and delete the rest.

If a comment hides a genuine surprise in our code, prefer a clearer name,
extracted variable, or type over keeping the comment. Only reshape code when it
is a trivial, local change; otherwise delete the comment and mention the
surprise in the report.

## Steps

1. Collect every comment in scope (`//`, `/* */`, JSDoc, JSX `{/* */}`, `#` in
   shell/YAML).
2. Classify each as keep or delete using the rules above. When unsure whether a
   comment is about an external system, check: would this still be true if we
   rewrote our code? If yes, keep. If it only makes sense because of how we
   wrote something, delete.
3. Delete. Do not change behavior. Remove blank lines left behind that would
   break formatting.
4. Run formatting and lint on touched packages:

   ```bash
   bunx turbo run lint --filter='<package-name>'
   ```

5. Report: number of comments deleted, comments kept with a one-line reason
   each, any constraints offered for encoding, and any code surprises that
   deserve a follow-up.
