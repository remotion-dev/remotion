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

To add an Element, create `elements/<slug>/<slug>.tsx`, add it to `elements/registry.ts`, and register its authoring composition in `remotion/Root.tsx`. The website and Studio use the same source files.

See the [Element guidelines](https://www.remotion.dev/elements/guidelines), [interactivity documentation](https://www.remotion.dev/docs/studio/interactivity), and [library integration guide](https://www.remotion.dev/docs/studio-protocol/component-library-integration) for layout, assets, dependencies, and installation requirements.

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

## License

Remotion’s [license terms](https://www.remotion.dev/license) apply. Choose a license for the Elements you publish.
