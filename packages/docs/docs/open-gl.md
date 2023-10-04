---
image: /generated/articles-docs-open-gl.png
id: gl-options
title: --gl flag
crumb: Flags
---

When rendering a video in Remotion, different [GL](https://en.wikipedia.org/wiki/OpenGL) renderer backends can be selected.

The following renderer backends are supported in Remotion:

- <code>null</code> - default
- <code>angle</code>
- <code>egl</code>
- <code>swiftshader</code>
- <code>vulkan</code> (from Remotion v4.0.41)
- <code>swangle</code> - default on Lambda

## Using the GPU

In cases where a GPU could be beneficial for rendering, it can often make sense to use the <code>angle</code> renderer. An in-depth explanation when and how to use it is given in [this article](/docs/gpu).

Memory leaks are a known problem with <code>angle</code>. We recommend to split up long renders into multiple parts when rendering large videos, since sometimes renders can fail due to memory leaks.

It's also worth mentioning, that currently GitHub Actions will fail when using <code>angle</code>, since actions don't have a GPU.

## The <code>angle</code> alternative if there is no GPU available

If you are rendering in an environment which has no GPU, the <code>angle</code> renderer can't be used and <code>swangle</code> should be utilized instead.

## Selecting the renderer backend

The renderer backend can be set in different ways:

### Via Node.JS APIs

In [`getCompositions()`](/docs/renderer/get-compositions#gl), [`renderStill()`](/docs/renderer/render-still#gl), [`renderMedia()`](/docs/renderer/render-media#gl), [`renderFrames()`](/docs/renderer/render-frames#gl), [`getCompositionsOnLambda()`](/docs/lambda/getcompositionsonlambda#gl), [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda#gl) and [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda#gl), you can pass [`chromiumOptions.gl`](/docs/renderer/render-still#gl).

### Via config file

```tsx twoslash
import { Config } from "@remotion/cli/config";

// ---cut---

Config.setChromiumOpenGlRenderer("angle");
```

:::note
Prior to `v3.3.39`, the option was called `Config.Puppeteer.setChromiumOpenGlRenderer()`.
:::

### Via CLI flag

Pass [`--gl=swiftshader`](/docs/cli) in one of the following commands: [`remotion render`](/docs/cli/render), [`remotion compositions`](/docs/cli/compositions), [`remotion still`](/docs/cli/still), [`remotion lambda render`](/docs/lambda/cli/render), [`remotion lambda still`](/docs/lambda/cli/still), [`remotion lambda compositions`](/docs/lambda/cli/compositions).

:::note
If a CLI flag gets passed, the settings defined in the <code>remotion.config.ts</code> will be overwritten.
:::

## Recommended renderers

Generaly speaking, in most cases the default renderer (<code>null</code> on local, <code>swangle</code> on Lambda) are the best choice.

If you use ThreeJS, <code>angle</code> (<code>swangle</code> on Lambda) has to be used.

Based on our research online, it seems that <code>swiftshader</code> is an old mode and <code>swangle</code> is the successor.  
Therefore, if you thought about using <code>swiftshader</code>, we recommend to use the <code>swangle</code> instead.

## See also

- [Using the GPU](/docs/gpu)
