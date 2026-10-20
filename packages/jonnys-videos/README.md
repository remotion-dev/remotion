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
bun install
```

**Start Preview**

```console
bun run dev
```

**Render video**

```console
bunx remotion render
```

## Roller ski video

The compositions from the `roller-skis` project are in the `RollerSkis` folder in
Studio. Their source is in `src/roller-skis`, and the media is hosted under
`https://remotion.media/jonnys-videos/roller-skis/`. The caption data needed by
the rough cut is kept with the composition source.

## Plane Sight hackathon video

The `PlaneSight` folder in Studio contains `PlaneSightPromo` (97.7 seconds,
1280 × 720 at 30 fps) and its scene compositions. The source was copied from
[`mcbuehler/PlaneSight`'s `promo/` project](https://github.com/mcbuehler/PlaneSight/tree/a793a54732c1c3d1b7f7385c1113d70f4d9987be/promo),
created at the October 10, 2026 hackathon. The original cuts, captions, and
normalized audio are preserved. Media is hosted under
`https://remotion.media/jonnys-videos/plane-sight/`.

Run these commands from `packages/jonnys-videos`:

```console
bun run dev
bunx remotion render PlaneSightPromo out/plane-sight-promo.mp4
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
