# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Using the overlay in a video editor

`remotion.config.ts` already exports a transparent Apple ProRes 4444 file, which Final Cut Pro, Adobe Premiere Pro and DaVinci Resolve import with its transparency ([Remotion's overlay guide](https://www.remotion.dev/docs/overlay)).

1. Keep the composition's background empty. In the Studio, the transparency toggle shows a checkerboard wherever the overlay is see-through.
2. Render it: `npx remotion render Overlay out/overlay.mov`
3. Import `out/overlay.mov` into your editor and put it on a track above your footage.

To check a render before importing it, run `npx remotion ffprobe out/overlay.mov`. It should report `prores` and a pixel format starting with `yuva`; the `a` is the transparency channel.

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
