# @remotion/remotion-media

Private package hosting [remotion.media](https://remotion.media): test media fixtures and a catalog UI.

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

Bundles and pre-renders the catalog UI, generates `llms.txt`, `robots.txt`, and `sitemap.xml`, and uploads everything to Cloudflare R2 when `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set:

```bash
bun run build
```

HLS files are uploaded through the AWS CLI so their MIME types are preserved.

## Production hosting and content negotiation

Production is served directly from the Cloudflare R2 bucket `parser-media`; the
Bun server in `src/index.tsx` is only used locally. Cloudflare Rules mirror its
content negotiation for requests to `https://remotion.media/`.

The conditional URL Rewrite Rule runs after the existing `/` to `/index.html`
rewrite and rewrites the path to `/llms.txt` when this expression matches:

```txt
raw.http.request.uri.path eq "/" and http.request.method in {"GET" "HEAD"} and (http.user_agent contains "Claude-User" or http.user_agent contains "opencode" or any(http.request.headers["accept"][*] contains "text/markdown") or any(http.request.headers["accept"][*] contains "text/x-markdown") or (any(http.request.headers["accept"][*] contains "text/plain") and not any(http.request.headers["accept"][*] contains "text/html")))
```

The following additional rules apply to the original root path:

- A Response Header Transform Rule sets `Vary: Accept, User-Agent` for
  `raw.http.request.uri.path eq "/"`.
- A Response Header Transform Rule uses the negotiation expression above and
  sets `Content-Type: text/markdown; charset=utf-8`.
- A Cache Rule bypasses caching for `raw.http.request.uri.path eq "/"`, avoiding
  collisions between the HTML and Markdown representations.

After deploying, verify browser, Markdown `Accept`, and known-agent requests:

```bash
curl -I -H 'Accept: text/html' https://remotion.media/
curl -I -H 'Accept: text/markdown' https://remotion.media/
curl -I -A 'Claude-User' https://remotion.media/
curl -I https://remotion.media/llms.txt
curl -I https://remotion.media/robots.txt
curl -I https://remotion.media/sitemap.xml
```
