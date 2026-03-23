# Remotion + Electron

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

This template uses Electron Forge, Vite, TypeScript, and Tailwind CSS to launch a minimal Electron app that renders a Remotion composition from the Electron main process.

The Electron window UI lives in `src/App.tsx` and is styled with Tailwind in `src/index.css`.

## Commands

**Install Dependencies**

```console
npm install
```

**Start the Electron app**

```console
npm run dev
```

Type a title, then click the export button in the app window. The app will ask where to save the video before rendering, show progress on the app icon while work is ongoing, and let you cancel an in-progress render from the UI.

In development, the Remotion project is bundled on each render so composition changes are always picked up. The first render may also download Chrome Headless Shell if no compatible local browser is installed yet.

**Run Remotion Studio**

```console
npm run studio
```

**Render the example video from the command line**

```console
npx remotion render HelloWorld
```

**Package the app**

```console
npm run build
```

During `npm run build`, Electron Forge creates a prebuilt Remotion bundle and stages the matching Remotion compositor package as part of the package step. The packaged app reuses that bundle at runtime instead of calling `bundle()` again.

The packaged binary also accepts `--integration-render-test <absolute-output-path>` for Remotion's automated integration test. It starts a hidden render immediately and is not needed for normal app usage, so feel free to remove `src/integration-render-test-mode.ts` and its import from `src/main.ts` in your own app.

**Upgrade all Remotion packages**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [Electron integration page](https://www.remotion.dev/docs/electron).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
