---
name: remotion-create
description: Creating a new Remotion video
metadata:
  tags: remotion
---

These are instructions for making a new Remotion project.  
If this is not the next task, see [../remotion-best-practices/SKILL.md](Remotion Best Practices)

Ensure Node.js and Git is installed, and the current folder is appropriate for starting a new project.

Scaffold one using:

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
cd my-video
npm i
```

Replace `my-video` with a suitable project name.

## Designing a video

Keep the scaffold and add React Markup. Follow [../remotion-markup/SKILL.md](Remotion React Markup Best Practices) and [rules/video-layout.md](rules/video-layout.md) for video-first layout and text sizing guidance.

## Interactivity Best Practices

By structuring the React Markup following [../remotion-interactivity/SKILL.md](Remotion Interactivity Best Practices), you allow the user to make edits in the Studio which write back to code.


## TailwindCSS

If Tailwind is requested, see [rules/tailwind.md](rules/tailwind.md) for using TailwindCSS in Remotion.

## Starting preview

```bash
npx remotion studio --no-open
```

This will start a long-running process and print the server URL for the preview.

## Follow-up

The video creation process has finished.
