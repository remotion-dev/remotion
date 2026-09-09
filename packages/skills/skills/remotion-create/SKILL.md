---
name: remotion-create
description: Create a new Remotion video
version: 4.0.522
---

These are instructions for making a new Remotion project and composition.  
If this is not the next task, see [Remotion Best Practices](../remotion-best-practices/SKILL.md)

## Scaffold a project

If a project already exists, skip this.
Ensure Node.js and Git is installed, and the current folder is appropriate for starting a new project.

Inspect the current folder, including hidden files, before choosing where to scaffold.

### Empty folder

If it is empty, or contains only disposable operating-system metadata such as `.DS_Store`, create the project directly in the current folder.
Remove only those disposable metadata files first, since `create-video` rejects non-empty folders.
Do not treat all hidden files as disposable: files such as `.env` and directories such as `.git` are meaningful contents.

Scaffold in existing folder:

```bash
npx create-video@latest --yes --blank --no-tailwind .
npm i
```

### Non-empty folder

If the current folder contains meaningful contents and no project already exists, scaffold into a new subfolder.
Replace `my-video` with a suitable project name.


```bash
npx create-video@latest --yes --blank --no-tailwind my-video
cd my-video
npm i
```

## Designing a video

Keep the scaffold and add React Markup.
Follow [Remotion React Markup Best Practices](../remotion-markup/SKILL.md) and [Video Layout Rules](video-layout.md) for video-first layout and text sizing guidance.

## Is this a multi-scene video?

If this is a video with multiple subsequence videos, follow guidance at [Multi-scene videos](../remotion-markup/multi-scene-video.md).

## Interactivity Best Practices

By structuring the React Markup following [Remotion Interactivity Best Practices](../remotion-interactivity/SKILL.md), you allow the user to make edits in the Studio which write back to code.

## TailwindCSS

If Tailwind is requested, see [tailwind.md](tailwind.md) for using TailwindCSS in Remotion.

## Open the preview

Start the preview server after building the composition:

```bash
npx remotion studio --no-open
```

This will start a long-running process and print the server URL for the preview.  
If the server is already started, it will print the URL.
If an in-harness browser is available, open it there.
You can visit a specific composition by navigating to `/[composition-id]`, for example `http://localhost:3000/MapAnimation`.

## Render the video

Only render if the user explicitly asks for it.

```
npx remotion render
```

For more options, see [Rendering](../remotion-render/SKILL.md).

## Follow-up

The video creation process has finished.
For follow-up prompts, use [Remotion Best Practices](../remotion-best-practices/SKILL.md)
