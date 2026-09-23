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
- `src/brand/` — the FinHub brand kit, to reuse in every video: `BilingualCaption`, `LowerThird`, `BadgeRow`, `EndCard`, with placeholder colours in `theme.ts`
- `public/badges/` — the owner's badges, for end cards and "why choose us" slides: `commbank-platinum-broker-2026-27.webp`, `small-business-champion-awards-2026-finalist.jpg`, `afca.png`, `connective.png`, `mfaa-accredited-finance-broker.png`. Only the CommBank badge works on a dark background; put the others on a white or light card. Keep the MFAA one small (the file is 174×161).
- Remotion and every `@remotion/*` package are installed at 4.0.517 — all of them may be imported

## Language: Vietnamese + English

Every video in this project is bilingual. The speech may be Vietnamese, English or a mix, and on-screen text is written in both. Unless the user says otherwise:

- Write real Vietnamese with every diacritic ("Lãi suất vay", never "Lai suat vay"), and `.normalize("NFC")` text that comes from transcripts or APIs.
- Put Vietnamese on the main line and English on a smaller line under it, with the same timing, as separate strings or caption tracks.
- Use fonts with Vietnamese glyphs. The Google Font Poppins has no `vietnamese` subset; use e.g. Be Vietnam Pro or Montserrat with `loadFont("normal", {weights: ["400", "700"], subsets: ["vietnamese", "latin"]})`.
- Use a `lineHeight` of about 1.3 or more, and don't clip text boxes, because Vietnamese marks stack above and below letters.
- For captions, never use English-only `.en` Whisper models. Use a multilingual one (`small`, `medium`, `large-v3`, `large-v3-turbo`) with `language: "vi"`. The translate option (`task: "translate"` or `translateToEnglish: true`) gives the English line, but not on `large-v3-turbo`, which can't translate.

## Environment rules

- **In claude.ai chat (no filesystem):** you cannot run `npm`, Remotion Studio, or a render. Deliver complete, ready-to-save files (full file contents, with the exact target path such as `my-video/src/MyScene.tsx`), never fragments. Remind the user to preview/render in Claude Code, Claude Cowork, or a terminal: `npm run dev` to preview, `npx remotion render` to export.
- **In Claude Cowork / Claude Code (filesystem available):** edit the files directly, run `npm run lint` before finishing, and use `npm run dev` to preview. Prefer the project-local skills in `my-video/.claude/skills/` if present — they are the same guides as this bundle.
- Animations must be driven by `useCurrentFrame()` / `interpolate()` / `spring()` — never wall-clock time, CSS transitions, or `setTimeout`.
- Users may have edited files outside the conversation (including visually in Remotion Studio); treat unexpected existing code as intentional.

## Keep it lean

- Reuse before writing: an existing scene, a [Remotion Element](https://www.remotion.dev/elements/), or an installed `@remotion/*` package, in that order. Write new code only when none fits.
- Build only what was asked: no extra scenes, props or schemas "for later".
- After the files, at most three short lines: what was skipped and when to add it. Explain more only when asked.
- With a filesystem, check the work with `npx remotion still <id> out/check.png --frame=<n> --scale=0.5` on the frames that matter, not a full render. An image costs tokens in proportion to its pixels.
