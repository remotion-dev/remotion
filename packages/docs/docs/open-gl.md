---
image: /generated/articles-docs-cli-render.png
id: gl-options
title: GL Options
crumb: CLI Reference
---

This page serves as an overview on the different GL render backends and when to choose which one.
When rendering a video in Remotion, different GL renderer backends can be selected.

Renderer backends supported in Remotion:

- <code>"angle" </code>
- <code>"egl"</code>
- <code>"swiftshader"</code>
- <code>"swangle" </code>
- <code>null</code>

## Default renderers

For local renders, the default renderer is set to <code>null</code>,
for renders in Lambda, the default is set to <code>"swangle"</code>

## Selecting the renderer backend

The renderer backend can be set in different ways.

### Via Node.JS APIs

In [`getCompositions()`](/docs/renderer/get-compositions#gl), [`renderStill()`](/docs/renderer/render-still#gl), [`renderMedia()`](/docs/renderer/render-media#gl), [`renderFrames()`](/docs/renderer/render-frames#gl), [`getCompositionsOnLambda()`](/docs/lambda/getcompositionsonlambda#gl), [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda#gl) and [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda#gl), you can pass [`chromiumOptions.gl`](/docs/renderer/render-still#gl).

### Via CLI flag

Pass [`--gl=swiftshader`](/docs/cli) in one of the following commands: [`remotion render`](/docs/cli/render), [`remotion compositions`](/docs/cli/compositions), [`remotion still`](/docs/cli/still), [`remotion lambda render`](/docs/lambda/cli/render), [`remotion lambda still`](/docs/lambda/cli/still), [`remotion lambda compositions`](/docs/lambda/cli/compositions).

### Via config file

```tsx twoslash
import { Config } from "@remotion/cli/config";

// ---cut---

Config.setChromiumOpenGlRenderer("angle");
```

:::note
Prior to `v3.3.39`, the option was called `Config.Puppeteer.setChromiumOpenGlRenderer()`.
:::

The renderer backend can be set in the <code>remotion.config.ts</code>, via CLI or it can be passed as chromiumOption to the differenc APIs.

## Using the GPU

In cases where a GPU could be beneficial for rendering, it can often make sense to use the "angle" renderer. An in-depth explenation is given in this article: [Using the GPU](/docs/gpu). Note that we recommend to split the render up in multiple parts when rendering large videos while using "angle", since sometimes renders can fail due to memory leaks.
It's also worth mentioning, that currently github acctions will fail when "angle" is used, since actions don't have a GPU. Unfortunately, there is currently no work around.

##

## The "angle" alternative if there is no GPU available

If you are rendering in an environment which has no GPU, the "angle" renderer can't be used and "swangle" should be utilized instead.
