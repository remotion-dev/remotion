---
name: remotion-create
description: Create a new Remotion video or composition and preview it in Remotion Studio
version: 4.0.503
---

These are instructions for making a new Remotion project and composition.  
If this is not the next task, see [Remotion Best Practices](../remotion-best-practices/SKILL.md)

## Default workflow: create, then open Studio

Treat requests to **make**, **create**, or **build** a video as requests for an editable composition, not as requests for a rendered video file.

After implementing the composition:

1. Start Remotion Studio and keep the process running.
2. Open the composition in an available in-app browser, or give the user the direct Studio URL if no browser is available.
3. Tell the user that the composition is ready to preview and edit.

Do not render the full video unless the user explicitly asks to **render**, **export**, or deliver a video file such as an MP4. A duration, aspect ratio, or phrase such as “promo video” does not by itself imply that a rendered file is required.

For example, “Make a 20-second promo video about Remotion” means build it and open it in Studio. “Export the promo video as an MP4” means render a file.

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

Keep the scaffold and add React Markup.
Follow [Remotion React Markup Best Practices](../remotion-markup/SKILL.md) and [Video Layout Rules](video-layout.md) for video-first layout and text sizing guidance.

## Is this a multi-scene video?

If this is a video with multiple subsequence videos, follow guidance at [Multi-scene videos](../remotion-markup/multi-scene-video.md).

## Interactivity Best Practices

By structuring the React Markup following [Remotion Interactivity Best Practices](../remotion-interactivity/SKILL.md), you allow the user to make edits in the Studio which write back to code.

## TailwindCSS

If Tailwind is requested, see [tailwind.md](tailwind.md) for using TailwindCSS in Remotion.

## Open the preview

For a video creation request, start the preview server after building the composition:

```bash
npx remotion studio --no-open
```

This will start a long-running process and print the server URL for the preview.  
If the server is already started, it will print the URL.
If an in-harness browser is available, open it there.
You can visit a specific composition by navigating to `/[composition-id]`, for example `http://localhost:3000/MapAnimation`.

Rendering is a separate follow-up step. Only proceed to a full render when the user explicitly requests an exported file. A one-frame render for implementation QA is allowed when useful, but it does not replace opening Studio for the user.

## Follow-up

The video creation process has finished.
For follow-up prompts, use [Remotion Best Practices](../remotion-best-practices/SKILL.md)
