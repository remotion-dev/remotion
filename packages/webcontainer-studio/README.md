# @remotion/webcontainer-studio

Run Remotion Studio entirely in the browser using [WebContainers](https://webcontainers.io).

## How it works

1. Boots a Node.js WebContainer inside the browser tab
2. Mounts the Remotion blank template files
3. Runs `npm install`
4. Starts `remotion studio`
5. Embeds the Studio in an iframe

## Development

```bash
bun run dev
```

Opens at http://localhost:3100.

## Requirements

The page must be served with:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

These headers are automatically set by the Vite dev server via `vite.config.ts`.
