# Remotion Element Library

A React Router + Tailwind CSS starter for publishing [Remotion Elements](https://www.remotion.dev/elements). Includes server-side rendering, an authoring Studio, and three editable examples. See the [third-party Element libraries](https://www.remotion.dev/elements/libraries) for examples of published catalogs.

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

## Build and deploy

```sh
npm run typecheck
npm run build
npm start
```

Deploy with an SSR-capable host using the [React Router deployment guide](https://reactrouter.com/start/framework/deploying). Use HTTPS and allow embedding in Remotion Studio, as described in the library integration guide.

## License

Remotion’s [license terms](https://www.remotion.dev/license) apply. Choose a license for the Elements you publish.
