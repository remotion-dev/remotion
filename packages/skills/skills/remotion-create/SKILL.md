---
name: remotion-create
description: Creating a new Remotion video
metadata:
  tags: remotion
---

These are instructions for making a new Remotion project and composition.  
If this is not the next task, see [Remotion Best Practices](../remotion-best-practices/SKILL.md)

## Scaffold a project

If a project already exists, skip this.
Ensure Node.js and Git is installed, and the current folder is appropriate for starting a new project.

Scaffold one using:

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
cd my-video
npm i
```

Replace `my-video` with a suitable project name.

## Designing a video

Keep the scaffold and add React Markup. Follow [Remotion React Markup Best Practices](../remotion-markup/SKILL.md) and [Video Layout Rules](video-layout.md) for video-first layout and text sizing guidance.

## Multi-scene videos

If the brief implies more than one scene (promo, story, chapters, before/after, etc.), structure the composition with [`<TransitionSeries>`](../remotion-markup/transitions.md) rather than a flat tree of sibling sequences:

```tsx
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}>
    <Scene1 />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 15})} />
  <TransitionSeries.Sequence durationInFrames={90}>
    <Scene2 />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

Rules:

- Put each scene in its own component (`Scene1`, `Scene2`, ...).
- Keep transitions short. Prefer about `12`-`20` frames at 30fps (roughly 0.4-0.7s). Default to `fade()` with `linearTiming({durationInFrames: 15})` unless the brief asks for a different presentation.
- Install the package when needed: `npx remotion add @remotion/transitions`.
- See [transitions](../remotion-markup/transitions.md) for overlays and other presentation types.

## Interactivity Best Practices

By structuring the React Markup following [Remotion Interactivity Best Practices](../remotion-interactivity/SKILL.md), you allow the user to make edits in the Studio which write back to code.

## TailwindCSS

If Tailwind is requested, see [tailwind.md](tailwind.md) for using TailwindCSS in Remotion.

## Starting preview

```bash
npx remotion studio --no-open
```

This will start a long-running process and print the server URL for the preview.

## Follow-up

The video creation process has finished.
For follow-up prompts, use [Remotion Best Practices](../remotion-best-practices/SKILL.md)
