# Remotion Element Library

A React Router + Tailwind CSS website for publishing your own Remotion Elements, with a local authoring Studio and three editable examples. The production website is a static site: no database, API server, or rendering service is needed.

## Develop

Install dependencies and start the website:

```sh
bun install
bun run dev
```

Open the URL printed by React Router (normally `http://localhost:5173`). In another terminal, start the authoring Studio:

```sh
bun run remotion:studio
```

The Studio lists all three example compositions. The website and Studio import the same component implementations. Edit files in `elements/` to update both previews. The website uses Vite; Studio uses Remotion's bundler.

With npm, use `npm install`, `npm run dev`, and `npx remotion studio` instead.

## Project structure

- `elements/<slug>/<slug>.tsx`: self-contained installable components, including their interactive schemas.
- `elements/registry.ts`: catalog metadata, components, dependencies, preview settings, and initial props.
- `remotion/`: preview stage and authoring Studio compositions.
- `app/`: React Router pages and Tailwind-styled UI.
- `lib/element-payload.ts`: raw source imports and validated Studio Protocol payloads.
- `lib/library-config.ts`: library name, description, and catalog URL.

The examples demonstrate different conventions:

- **Animated title**: a centered, editable title with entrance and exit animations.
- **Lower third**: separately editable name and role bars, adapted from the official Name Lower Third Element.
- **Moving grid**: a full-composition loop, using `Interactive.create()` and color controls in the Inspector.

The examples do not need external fonts, assets, or additional packages. The website loads Inter from its official CDN with a system-font fallback; this font is not installed with Elements.

## Customize the website

Change the identity in `lib/library-config.ts`. Change colors and fonts in `app/app.css`, and Tailwind utilities in the route and component files. Replace the example descriptions and usage notes in `elements/registry.ts`.

The website registers its current origin by default, which works for localhost and deployment preview URLs. To always register the production catalog, set `libraryConfig.url` to your absolute HTTPS homepage URL, for example `https://elements.example.com/`. This template assumes deployment at the domain root.

## Add an Element

1. Create `elements/my-element/my-element.tsx`. Export exactly one named React component from this file. Keep all implementation code in that file; imports of sibling project files will not exist in the receiving project.
2. Import the component into `elements/registry.ts` and add one entry with `slug: "my-element"`. Use a unique, lowercase, hyphenated slug.
3. Set the description, usage notes, preview width/height, FPS, duration, and a representative `posterFrame` within that duration. The registry drives the gallery, detail page, and prerendered URL automatically. Add a matching preview composition in `remotion/Root.tsx` for local authoring.
4. Declare every additional package in `dependencies`. Exclude `react`, `react-dom`, and `remotion`. Remotion packages use `version: null`; other packages need an exact version, not a range.
5. Run `bun run lint` and `bun run build`. The website validates every payload with `createElementPayload()` during the build. Also install the Element into a clean project to check that it works independently.

The site imports each component normally for its Player preview, then loads the **same file** with Vite's `?raw` support for installation. Do not create a second source-code copy. Keep Vite-specific source loading out of `remotion/` and the installable component files.

### Layout and interactivity

Use `installationMode: "wrapped"` for separately editable layers. Studio supplies the placement Sequence. Keep the Element's smallest useful bounding box in `dimensions`; the preview stage centers it without adding padding to the installed source.

Use `installationMode: "component-owned-sequence"` for a single interactive object. Export the `Interactive.create()` result directly. Use `layout: "absolute-fill"` for backgrounds and `layout: "none"` for bounded objects. In the latter case, forward the `style` prop to the visual root. For backgrounds that adapt to their parent, set `dimensions: null`.

Keep styles inline in installable source. Tailwind classes, website CSS, and preview backgrounds are not copied to the user's project. Temporary overlays should animate both in and out.

Authoring compositions use explicit registrations and inline `defaultProps` so Studio can save edits. Keep their dimensions, FPS, and duration in sync with the registry. Edit the Element's individual source nodes in Studio or your editor. For a schema-enabled Element, you can also register the exported component directly as a connected composition.

Read the [Element guidelines](https://www.remotion.dev/elements/guidelines) and [library integration guide](https://www.remotion.dev/docs/studio-protocol/component-library-integration).

### Assets and initial props

Use `initialProps` for ordinary preview values. For assets that should remain hosted, keep their absolute URL strings there.

To copy an asset into the receiving project:

1. Serve the file at a public HTTPS URL.
2. Add an asset entry, for example `{type: "url", url: "https://elements.example.com/logo.png", path: "my-library/my-element/logo.png"}`.
3. Keep the URL string in the corresponding preview prop.
4. Use `staticFileRef("my-library/my-element/logo.png")` from `@remotion/studio-protocol` in `installationProps` for the corresponding installed prop.

`installationProps` shallowly overrides `initialProps` only when creating the install payload. An overridden object or array replaces that entire prop. Never pass `staticFileRef()` objects to the Player. For component-owned Elements, do not put `from`, `durationInFrames`, or `name` in initial props; Studio supplies them.

## Studio Protocol

- **Add library to Studio** uses `addElementLibraryToStudio()` to request registration in the most recently focused compatible local Studio. The user confirms before Studio updates `remotion.config.ts`.
- **Use** on gallery cards and **Use in Studio** on detail pages use `installInStudio()`. Card buttons appear on hover or keyboard focus and remain visible on touch devices. The user confirms the installation destination in Studio.
- Dragging an Element card or its Use button uses `setStudioDragData()` with the same payload.
- Embedded browsing uses `isInsideStudio()` to hide redundant chrome. Internal links preserve the Studio query parameters.
- Failed requests open a standalone adaptation of the official library’s fallback: Studio setup links, retry, drag/copy-source alternatives for Elements, and manual URL registration for libraries. Guidance stays out of the gallery and does not resize the navbar.

A successful response means the request reached Studio, not that the user accepted it. The UI intentionally says to confirm in Studio.

The authoring Studio is for developing Elements. Verify distribution in a **separate clean Remotion project** with a composition and a `remotion.config.ts`. Focus that Studio immediately before installing, especially if several Studios are open. If no insertion destination is focused, drag the Element onto the composition or timeline instead.

There is no catalog JSON API and no library npm package to install. The public website delivers component source and installation metadata. Treat all Element source as public.

## Build and deploy

```sh
bun run lint
bun run build
bun run preview
```

Deploy `build/client/` to a static host. The build prerenders `/` and every registered `/elements/<slug>` page. Do not deploy `build/server/`; it is only used during prerendering.

A `vercel.json` is included: use the repository root as the project root, install dependencies, and run `npm run build` (or `bun run build`). No environment variables or cloud credentials are required.

For other hosts:

- Serve directory `index.html` files for clean URLs, including `/elements/animated-title`.
- If you enable an SPA fallback, use `__spa-fallback.html` for unknown paths, not the prerendered home page. Known Element paths should serve their own HTML. A host-level 404 is also acceptable for unknown URLs.
- Use HTTPS. Studio Protocol supports HTTP only on `localhost` and `127.0.0.1`.
- Allow the website to be embedded by local Studio origins. Do not send `X-Frame-Options: DENY` or `SAMEORIGIN`, or a restrictive CSP `frame-ancestors` policy that blocks Studio. Adjust your hosting provider's defaults if necessary.
- Set the production catalog URL in `lib/library-config.ts` if you do not want preview deployments registered as separate libraries.

Before publishing, verify direct navigation and refresh on each Element URL, library registration, iframe navigation, click installation, and cross-tab drag-and-drop from the HTTPS deployment. Check the installed source and compare its output with the Player preview.

## Maintenance and versioning

Elements are source-code copies, not managed dependencies. Updating this website does not update already installed Elements. Keep slugs stable, document breaking changes, and use Git tags/releases to record published versions. Users can reinstall and review changes themselves.

Keep all Remotion packages on the same version. This template requires the release containing `Interactive.create()` (the upcoming 4.0.536 release); the published 4.0.535 packages do not provide it. Until that release, develop against the Remotion monorepo workspace packages. Publish this template only after the matching Remotion and ESLint configuration packages are released. The receiving project also needs a compatible Remotion version.

Upgrade with:

```sh
bunx remotion upgrade
```

The npm equivalent is `npx remotion upgrade`.

To export an example preview video locally:

```sh
bunx remotion render animated-title out/animated-title.mp4
```

The npm equivalent is `npx remotion render animated-title out/animated-title.mp4`.

## License

Remotion's [license terms](https://www.remotion.dev/license) apply. Set and document the license for the Elements you publish so users know how they may use and modify the source.
