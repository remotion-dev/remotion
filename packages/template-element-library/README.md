# Remotion Element Library

A React Router + Tailwind CSS starter for publishing [Remotion Elements](https://www.remotion.dev/elements). Includes a prerendered static website, an authoring Studio, and four editable examples. See the [third-party Element libraries](https://www.remotion.dev/elements/libraries) for examples of published catalogs.

## Develop

Use npm, pnpm, Yarn, or Bun. The commands below use npm:

```sh
npm install
npm run dev
```

In another terminal, start the authoring Studio:

```sh
npm run remotion:studio
```

For exports and upgrades, see [`npx remotion render`](https://www.remotion.dev/docs/cli/render) and [`npx remotion upgrade`](https://www.remotion.dev/docs/cli/upgrade).

## Customize

- `app/`: website routes, layout, and styles. Replace “Studio Supply” with your library name.
- `elements/`: self-contained components and the shared catalog registry.
- `remotion/`: authoring compositions and the preview stage.
- `lib/element-payload.ts`: raw source loading and Studio Protocol payloads.

To add an Element, create `elements/<slug>/<slug>.tsx`, add its metadata to `elements/registry.ts`, map its component in `remotion/ElementPreview.tsx`, and register its authoring composition in `remotion/Root.tsx`. The detail page, preview renderer, and Studio use the same source files. Gallery previews are rendered assets, not live Players.

See the [Element guidelines](https://www.remotion.dev/elements/guidelines), [interactivity documentation](https://www.remotion.dev/docs/studio/interactivity), and [library integration guide](https://www.remotion.dev/docs/studio-protocol/component-library-integration) for layout, assets, dependencies, and installation requirements.

## Render and upload previews

The starter previews are hosted on `remotion.media`. The gallery and caption picker use posters and hover/focus videos from `elements/previews.json`. Rendering uses a separate entry point, `remotion/previews.tsx`, with dimensions and default props from the registry. Source edits appear in the listing after you rerender.

```sh
npm run render-previews
# Or render one Element:
npm run render-previews -- --element=animated-title
```

This renders PNG posters and muted MP4 videos into ignored `public/previews/` directories and updates the manifest to local URLs. Transparent previews use WebM instead of MP4. Review the results with `npm run dev`. Playback failures and reduced-motion preferences retain the poster. Pass `--browser-executable=/path/to/chrome` to use an existing browser.

To publish previews, copy `.env.example` to `.env` and configure your own S3-compatible bucket, endpoint, public HTTPS URL, and credentials. For R2, enable a [public domain](https://developers.cloudflare.com/r2/buckets/public-buckets/) for the bucket. Credentials are used only by the upload script; never prefix them with `VITE_`.

```sh
npm run upload-previews
# Or upload one reviewed Element:
npm run upload-previews -- --element=animated-title
```

Uploads use unique URLs and verify public content types and SHA-256 checksums before updating `elements/previews.json`. Existing hosted assets are never overwritten. Commit the updated manifest, then rebuild the website. Local renders remain ignored and can be removed after upload; shipping local previews instead is also supported.

## Caption styles

`/captions` is a separate gallery and Studio caption-style picker. Library registration includes this URL as `captionStylesUrl`. In Studio's captions context, the page hides navigation, uses a transparent background, and reflects selection and Reset through [`subscribeToCaptionStyleSelection()`](https://www.remotion.dev/docs/studio-protocol/subscribe-to-caption-style-selection).

Accent captions remixes [Word Highlight Captions](https://www.remotion.dev/elements/captions/word-highlight-captions) with a system font and warm accent. Caption Elements accept `Caption[]`, expose `Interactive.captionsSchema`, and use component-owned installation with `isCaptionStyle: true`. Set their registry category to `Captions` to include them in the picker.

## Build and deploy

```sh
npm run lint
npm run build
npm run preview
```

Publish `build/client` to a static host. All Element pages are prerendered from the registry. See the [React Router prerendering guide](https://reactrouter.com/how-to/pre-rendering) for static hosting and fallback routing. Use HTTPS and allow embedding in Remotion Studio, as described in the library integration guide.

## Markdown and agent discovery

Each page declares its Markdown URL with a `<link rel="alternate" type="text/markdown">` tag. Agents can follow `/index.md` from the homepage to find every Element without guessing URLs or running JavaScript.

Markdown uses the website's registry, installation payloads, and source files. New registry entries appear in the catalog and build automatically. Resource routes serve Markdown during development; builds write `.md` files to `build/client`. You don't need a production server or host integration.

Serve `.md` files directly, preferably with `Content-Type: text/markdown; charset=utf-8`. The routes set development headers; your host sets production headers.

### Optional content negotiation

Static files cannot inspect `Accept` headers. To serve Markdown at HTML URLs when a client prefers `text/markdown`, configure your host or server to rewrite each page URL to its Markdown file.

Keep HTML for browser requests. Respect quality values: an HTML preference or `text/markdown;q=0` must not select Markdown. Rewrite only existing pages on GET/HEAD, normalize trailing slashes, and leave assets and `.md` URLs unchanged. Set `Vary: Accept` on both responses and configure your CDN to cache them separately, or disable caching for these URLs.

Direct `.md` links work without negotiation.

## License

Remotion’s [license terms](https://www.remotion.dev/license) apply. Choose a license for the Elements you publish.
