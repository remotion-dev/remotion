---
name: add-sfx
description: Add a new sound effect to @remotion/sfx
---

## Prerequisites

Sound effects must first be added to the [remotion.media](./packages/remotion-media) package.  
Then it can be deployed using `bun run build`. The `.env` may be missing if we are in a worktree, but on the main non-worktree branch it should be present.

The source of truth is `generate.ts` in that repo. A sound effect must exist there before it can be added to `@remotion/sfx`.

Sound effects must be:

- WAV format
- CC0 (Creative Commons 0) licensed
- Normalized to peak at -3dB

## Steps

### 1. Add to `remotion.media` repo (must be done first)

In the `remotion-dev/remotion.media` repo:

1. Add the WAV file to the root of the repo
2. Add an entry to the `soundEffects` array in `generate.ts`:
   ```ts
   {
     fileName: "my-sound.wav",
     attribution:
       "Description by Author -- https://source-url -- License: Creative Commons 0",
   },
   ```
3. Run `bun generate.ts` to copy it to `files/` and regenerate `variants.json`
4. Deploy

### 2. Add the export to `packages/sfx/src/index.ts`

Use camelCase for the variable name. Avoid JavaScript reserved words (e.g. use `uiSwitch` not `switch`).

```ts
export const mySound = 'https://remotion.media/my-sound.wav';
```

### 3. Create a doc page at `packages/docs/docs/sfx/<name>.mdx`

Follow the pattern of existing pages (e.g. `whip.mdx`). Include:

- Frontmatter with `image`, `title` (camelCase export name), `crumb: '@remotion/sfx'`
- `<AvailableFrom>` tag with the next release version
- `<PlayButton>` import and usage
- Description
- Example code using `@remotion/media`'s `<Audio>` component
- Value section with the URL in a fenced code block
- Duration section (fetch the file and use `afinfo` on macOS to get duration/format)
- Attribution section with source link and license
- Convert section with a full-link sentence: `[Open this file on remotion.dev/convert](https://remotion.dev/convert?url=<encoded-sfx-url>)`
- See also section linking to related sound effects

### 4. Register in sidebar and table of contents

- `packages/docs/sidebars.ts` — add `'sfx/<name>'` to the `@remotion/sfx` category items
- `packages/docs/docs/sfx/table-of-contents.tsx` — add a `<TOCItem>` with a `<PlayButton size={32}>`

### 5. Regenerate SFX waveforms

After the sound is added to `packages/remotion-media` and exported from `packages/sfx/src/index.ts`, regenerate the waveform samples used by the docs:

```bash
bun packages/docs/generate-sfx-waveforms.ts
```

This uses `ffmpeg` to sample every exported sound effect into around 2000 waveform samples and updates `packages/docs/components/sfx-demos/sfx-waveforms.ts`.

### 6. Update the skills rule file

Add the new URL to the list in `packages/skills/skills/remotion/rules/sfx.md`.

### 7. Build

```bash
cd packages/sfx && bun run make
```

## Naming conventions

| File name       | Export name                |
| --------------- | -------------------------- |
| `my-sound.wav`  | `mySound`                  |
| `switch.wav`    | `uiSwitch` (reserved word) |
| `page-turn.wav` | `pageTurn`                 |

## Version

Use the current version from `packages/core/src/version.ts`.
For docs `<AvailableFrom>`, increment the patch version by 1.
