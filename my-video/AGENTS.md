# my-video

A Remotion project: videos are written as React components and rendered to MP4/WebM. Remotion and all `@remotion/*` packages are pinned to the same version (see `package.json`) — keep them in lockstep when upgrading (`npx remotion upgrade`).

## Commands

```console
npm i                 # install dependencies
npm run dev           # Remotion Studio preview (http://localhost:3000)
npm run lint          # ESLint + TypeScript check — run before committing
npx remotion render   # render a composition to a video file
```

Rendering and Studio need Node.js and a Chrome/Chromium download; they work in Claude Code, Claude Cowork and local terminals, but not in claude.ai chat.

## Project structure

- `src/index.ts` — entry point, registers the root component
- `src/Root.tsx` — every `<Composition>` must be registered here
- `src/Composition.tsx` — the `MyComp` composition (1280×720 @ 30fps)
- `src/index.css` — Tailwind v4 is enabled (`@import "tailwindcss"`)
- `public/` — static assets, referenced with `staticFile()`
- `out/`, `build/`, `node_modules/` — generated, never commit

## Skills

`.claude/skills/` contains the official Remotion agent skills (vendored from this monorepo's `packages/skills`, matching the pinned Remotion version). Start with `remotion-best-practices` — it routes to the specific skill for the task (creating compositions, markup/animation, captions, maps, rendering, Studio). Follow them when writing any Remotion markup.

When upgrading Remotion, re-vendor the skills so guidance matches the installed version:

```console
node scripts/vendor-skills.mjs   # defaults to ../packages/skills/skills; pass another source path if needed
```

The script copies the skills without their symlinks (which break on Windows checkouts and inflate zip bundles), rewrites sibling-skill links accordingly, and fails if any relative link is broken. Do not copy the skills by hand.

## Conventions

- Register new compositions in `src/Root.tsx`; one component per file under `src/`.
- Drive all animation from `useCurrentFrame()`/`interpolate()`/`spring()` — never from wall-clock time.
- Users may edit files between conversations (including visually in Remotion Studio); treat surprising diffs as intentional and don't overwrite them.
- Run `npm run lint` before committing.
