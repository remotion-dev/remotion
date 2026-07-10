# @remotion/remotion-media

Private package hosting [remotion.media](https://remotion.media): test media fixtures and a catalog UI for `@remotion/media`.

## Development

```bash
bun install
cd packages/remotion-media
bun run dev
```

## Generate test media

Requires `ffmpeg` on your PATH. Renders base compositions from `src/compositions/` and writes variants to `files/` (gitignored), then updates `variants.json`.

```bash
bun run generate
```

Place `multiple-audio-streams.mov` in the package root before running `generate` if you want that edge-case fixture included in the catalog.

## Build and deploy

Bundles the catalog UI and uploads to Cloudflare R2 when `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set:

```bash
bun run build
```

HLS files are uploaded through the AWS CLI so their MIME types are preserved.
