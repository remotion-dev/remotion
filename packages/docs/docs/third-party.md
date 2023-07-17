---
image: /generated/articles-docs-third-party.png
id: third-party
title: Third party integrations
sidebar_label: Third party integrations
crumb: "Integrations"
---

All animations in Remotion must be driven by the value returned by the [`useCurrentFrame()`](/docs/use-current-frame) hook. If you would like to use another way of animations in Remotion, you need an integration that supports synchronizing the timing with Remotion.

On this page, we maintain a list of integrations for popular ways of animating on the web, and provide status for popular requests.

## GIFs

Use the [`@remotion/gif`](/docs/gif) package.

## Framer Motion

At the moment, we don't have a Framer Motion integration, but are discussing the matter on [GitHub Issues](https://github.com/remotion-dev/remotion/issues/399).

## Anime.JS

See [this repository](https://github.com/remotion-dev/anime-example) for an example.

## Lottie

Use the [`@remotion/lottie`](/docs/lottie) package.

## Rive

Use the [`@remotion/rive`](/docs/rive) package.

## After Effects

See: [Lottie - Import from After Effects](/docs/after-effects)

## Three.JS

Use the [`@remotion/three`](/docs/three) package.

## React Native Skia

Use the [`@remotion/skia`](/docs/skia) package.

## react-spring

There is no direct compatibility but Remotion provides it's own [`spring()`](/docs/spring) instead.

## Reanimated

There is no integration available but Remotion shares some code with Reanimated, in particular [`interpolate()`](/docs/interpolate), [`spring()`](/docs/spring) and [`Easing`](/docs/easing). This makes it easier to refactor already existing animation from Reanimated.

## TailwindCSS

See: [TailwindCSS](/docs/tailwind)

## CSS animations

You can synchronize animations with Remotions time using the `animation-play-state` and `animation-delay` CSS properties. Check out [example code](https://github.com/ahgsql/remotion-animation/blob/main/src/index.js) or use the [remotion-animation](https://github.com/ahgsql/remotion-animation/blob/main/src/index.js) library directly (Warning: Inofficial library, no TypeScript types).

## GreenSock

See: [How to integrate GreenSock with Remotion](https://enlear.academy/how-to-integrate-greensock-with-remotion-e4eee6f5a41f)

## Other libraries

Are you interested in using other libraries with Remotion? You can [file a GitHub issue](https://github.com/remotion-dev/remotion/issues/new) to inquire it. While we cannot guarantee to help, you can register interest and kick off the discussion.
