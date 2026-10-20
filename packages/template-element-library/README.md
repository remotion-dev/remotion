# Remotion Element Library

Use this React Router and Tailwind CSS starter to publish [Remotion Elements](https://www.remotion.dev/elements). The starter includes a prerendered static website, an authoring Studio, and four editable examples. For published catalogs, see [third-party Element libraries](https://www.remotion.dev/elements/libraries).

## Develop

Use npm, pnpm, Yarn, or Bun. The commands below use npm:

```sh
npm install
npm run dev
```

Start the authoring Studio in another terminal:

```sh
npm run remotion:studio
```

For exports and upgrades, see [`npx remotion render`](https://www.remotion.dev/docs/cli/render) and [`npx remotion upgrade`](https://www.remotion.dev/docs/cli/upgrade).

## Customize

- `app/` contains website routes, layout, and styles. Replace "Studio Supply" with your library name.
- `elements/` contains the Element components and the catalog registry. Each Element component is self-contained.
- `remotion/` contains authoring compositions and the preview stage.
- `lib/element-payload.ts` loads raw source files and creates Studio Protocol payloads.

Do these steps to add an Element:

1. Create `elements/<slug>/<slug>.tsx`.
2. Add the Element metadata to `elements/registry.ts`.
3. Map the Element component in `remotion/ElementPreview.tsx`.
4. Register the authoring composition in `remotion/Root.tsx`.

The detail page, preview renderer, and Studio use the same source files. The gallery uses rendered previews. It does not use live Players.

See the [Element guidelines](https://www.remotion.dev/docs/studio/creating-elements), [interactivity documentation](https://www.remotion.dev/docs/studio/interactivity), and [library integration guide](https://www.remotion.dev/docs/studio-protocol/component-library-integration) for layout, assets, dependencies, and installation requirements.

## Render and upload previews

`remotion.media` hosts the example previews. The gallery and caption picker use `elements/previews.json` for posters and videos. The videos play on hover or focus.

The `remotion/previews.tsx` entry point renders previews. The renderer uses dimensions and default props from the registry. After you change an Element, render its previews again.

```sh
npm run render-previews
# Or render one Element:
npm run render-previews -- --element=animated-title
```

The script writes PNG posters and muted MP4 videos to `public/previews/`. Git ignores this directory. The script updates the manifest with local URLs. The script uses WebM instead of MP4 for transparent previews.

Use `npm run dev` to check the previews. If playback fails or the user prefers reduced motion, the poster stays visible. To use an existing browser, add `--browser-executable=/path/to/chrome` to the command.

To upload previews, copy `.env.example` to `.env`. Set the bucket, endpoint, public HTTPS URL, and credentials for your S3-compatible storage. If you use R2, enable a [public domain](https://developers.cloudflare.com/r2/buckets/public-buckets/) for the bucket.

Only the upload script uses these credentials. Do not add `VITE_` to the start of credential names.

```sh
npm run upload-previews
# Or upload one reviewed Element:
npm run upload-previews -- --element=animated-title
```

The upload script uses unique URLs. The script checks the public files for correct content types and SHA-256 checksums. Then it updates `elements/previews.json`. It does not overwrite existing hosted assets.

Commit the updated manifest. Build the website again.

Git ignores local preview files. You can delete these files after the upload. You can also deploy local previews with the website without an upload.

## Caption styles

The `/captions` page is a gallery and a Studio caption-style picker. Register its URL as the `captionStylesUrl` for your library.

In the Studio captions context, the page hides navigation and uses a transparent background. The page uses [`subscribeToCaptionStyleSelection()`](https://www.remotion.dev/docs/studio-protocol/subscribe-to-caption-style-selection) to respond to selection and Reset.

Accent captions uses [Word Highlight Captions](https://www.remotion.dev/elements/captions/word-highlight-captions) as its base. It has a system font and warm accent.

Caption Elements accept `Caption[]` and expose `Interactive.captionsSchema`. They use component-owned installation with `isCaptionStyle: true`. Set the registry category to `Captions` to show an Element in the picker.

## Build and deploy

```sh
npm run lint
npm run build
npm run preview
```

The default build prerenders all Element pages from the registry. Publish `build/client` to a static host. See the [React Router prerendering guide](https://reactrouter.com/how-to/pre-rendering) for static hosting and fallback routing.

Serve the website with HTTPS. Allow embedding in Remotion Studio. See the library integration guide for embedding requirements.

## Markdown and agent discovery

Each page with Markdown has a `<link rel="alternate" type="text/markdown">` tag. The tag gives the Markdown URL.

Agents can follow `/index.md` from the homepage to find every Element. They do not need to guess URLs or run JavaScript.

`app/routes.ts` registers the Markdown resource routes. HTML-only pages do not need a Markdown route.

HTML and Markdown use the same Element registry, installation payloads, and source files. When you add an Element, it appears in both formats.

The static build writes `.md` files to `build/client`. These files do not need a production server or host integration.

Configure your host to serve `.md` files directly. If possible, set `Content-Type: text/markdown; charset=utf-8`. The routes set headers during development. The host sets headers in production.

### Content negotiation with SSR

To use SSR:

1. Set `const ssr = true` in `react-router.config.ts`.
2. Deploy with an SSR adapter for your host.

This setting disables prerendering. React Router handles page requests instead of serving static HTML.

The server middleware in `app/routes/layout.tsx` checks the `Accept` header. It returns Markdown at page URLs when the client prefers `text/markdown`. It uses quality values to select the format. It returns HTML when the browser prefers HTML.

The middleware supports negotiation for GET and HEAD requests. It does not change data requests. Both formats include the `Vary: Accept` response header. Configure your CDN to use this header for its cache.

Direct `.md` links also work on static hosts. For content negotiation, configure routing rules on the static host. Application code does not run when a static host serves these files.

## License

The [license terms](https://www.remotion.dev/license) for Remotion apply. Choose a license for the Elements you publish.
