---
name: studio-mode
description: Understand the capabilities and restrictions of each Remotion Studio mode. Use when implementing or reviewing Studio actions, permissions, availability, or UI across interactive, detached, deployed, and browser-based Studios.
---

# Studio Modes

Remotion Studio operates in four modes:

1. **Regular interactive Studio:** Started with `npx remotion studio`. A Studio server is attached and the Studio is fully interactive. It can render server-side, use "Open in" actions, execute codemods, install packages, and perform other server-backed actions.
2. **Regular Studio with the preview server detached:** `previewServerConnected` is `false`. The Studio is effectively read-only, although client-side rendering remains available.
3. **Read-only Studio:** A deployed Studio with no server attached. Hide or disable actions that require a server. GitHub is the only supported "Open in" action.
4. **Browser Studio:** Deployed at `remotion.dev/new` and backed by a virtual file system that is hidden from the user. It cannot use "Open in" actions, but it can install dependencies and execute codemods.

When adding or changing a Studio action, determine which modes support it and hide or disable it everywhere else.
