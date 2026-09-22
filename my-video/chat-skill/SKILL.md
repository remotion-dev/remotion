---
name: remotion-video
description: Author and edit Remotion videos (programmatic video with React) for the my-video project in the danielnguyenfinhub/remotion repository. Use when asked to make, edit, or plan a video, animation, motion graphic, intro, or explainer built with Remotion — including writing compositions, animations, captions, maps, and planning renders. Not for general React apps.
---

# Remotion video authoring

Remotion makes videos from React components: each frame is a render of the component tree at a given frame number. This skill bundles the official Remotion best-practice guides for version 4.0.517 (matching the project) so you can author correct composition code from any Claude surface.

## Start here

Read [remotion-best-practices/SKILL.md](./remotion-best-practices/SKILL.md) first — it is the router that tells you which bundled guide to load for the task (creating a composition, React markup and animation, captions, maps, multimedia, rendering, Studio). Follow the guide it points to before writing code.

## The target project

Code you write targets the `my-video/` project in the `danielnguyenfinhub/remotion` repository:

- `src/Root.tsx` — every `<Composition>` must be registered here
- `src/Composition.tsx` — existing `MyComp` composition (1280×720 @ 30fps)
- `src/index.css` — Tailwind v4 is enabled
- `public/` — static assets, referenced with `staticFile()`
- Remotion and every `@remotion/*` package are installed at 4.0.517 — all of them may be imported

## Environment rules

- **In claude.ai chat (no filesystem):** you cannot run `npm`, Remotion Studio, or a render. Deliver complete, ready-to-save files (full file contents, with the exact target path such as `my-video/src/MyScene.tsx`), never fragments. Remind the user to preview/render in Claude Code, Claude Cowork, or a terminal: `npm run dev` to preview, `npx remotion render` to export.
- **In Claude Cowork / Claude Code (filesystem available):** edit the files directly, run `npm run lint` before finishing, and use `npm run dev` to preview. Prefer the project-local skills in `my-video/.claude/skills/` if present — they are the same guides as this bundle.
- Animations must be driven by `useCurrentFrame()` / `interpolate()` / `spring()` — never wall-clock time, CSS transitions, or `setTimeout`.
- Users may have edited files outside the conversation (including visually in Remotion Studio); treat unexpected existing code as intentional.
