---
name: ssr
description: Use Remotion server-side rendering in a SaaS or web app.
metadata:
  tags: remotion, saas, ssr, renderer, node, bun, render-server
---

# SSR

Use Node/Bun SSR APIs when a server process should create media files with Remotion. Choose this for custom render servers, queue workers, local automation, or framework backends that have enough CPU, memory, disk, and browser dependencies.

Canonical docs:

- SSR overview: https://www.remotion.dev/docs/ssr.md
- Renderer package: https://www.remotion.dev/docs/renderer.md
- Node SSR: https://www.remotion.dev/docs/ssr-node.md

## When SSR fits

Use SSR when the app needs:

- Render/progress/cancel endpoints.
- Queue integration or background workers.
- Custom output paths and storage uploads.
- Authenticated server-side media generation.
- CLI parity from code instead of shelling out to `npx remotion render`.

Do not pick plain SSR if the deployment cannot provide browser dependencies, enough CPU/memory, writable disk, and long enough execution time.

## Render server template

For a standalone API server with render, progress, and cancel endpoints, use `packages/template-render-server` as the implementation reference.

Before production, handle authentication, rate limiting, cost controls, output cleanup, privacy, progress polling, cancellation, and error reporting.

## Cloud alternatives

If the user wants managed scaling or cannot run Chromium in their server runtime, route back to [framework.md](framework.md):

- Vercel Sandbox for Vercel apps.
- Lambda for production SaaS apps that can use AWS.
- Web Renderer / client-side rendering when rendering should run on the user's device and experimental browser limits are acceptable.
