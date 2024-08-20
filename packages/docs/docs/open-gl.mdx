---
image: /generated/articles-docs-open-gl.png
id: gl-options
title: --gl flag
crumb: Flags
---

When rendering a video in Remotion, different [GL](https://en.wikipedia.org/wiki/OpenGL) renderer backends can be selected.

The following renderer backends are supported in Remotion:

- <code>null</code> - default, lets Chrome decide
- <code>angle</code>
- <code>egl</code>
- <code>swiftshader</code>
- <code>vulkan</code> (from Remotion v4.0.41)
- <code>angle-egl</code> (from Remotion v4.0.52)
- <code>swangle</code> - default on Lambda

## Recommended renderers

<Step>1</Step> If you use WebGL/Three.js:

- On a desktop, `angle` is recommended
- On a [cloud instance with a GPU](/docs/miscellaneous/cloud-gpu), `angle-egl` is recommended
- On Lambda, use `swangle` (default on Lambda)
- On a machine with no GPU, `swangle` is recommended. Rendering might be slow.

<Step>2</Step> If you don't use WebGL/Three.js, the default renderer (<code>null</code> on local, <code>swangle</code> on Lambda) are the best choice.<br/>

## Using the GPU

In cases where a GPU could be beneficial for rendering, it can often make sense to use the <code>angle</code> renderer (<code>angle-egl</code> on Linux). An in-depth explanation when and how to use it is given in [this article](/docs/gpu).

⚠️ Memory leaks are a known problem with <code>angle</code>. We recommend to split up long renders into multiple parts when rendering large videos, since sometimes renders can fail due to memory leaks.

Currently, GitHub Actions will fail when using <code>angle</code>, since Actions runners don't have a GPU.

## Selecting the renderer backend

The renderer backend can be set in different ways:

### Via Node.JS APIs

In [`getCompositions()`](/docs/renderer/get-compositions#chromiumoptions), [`renderStill()`](/docs/renderer/render-still#gl), [`renderMedia()`](/docs/renderer/render-media#gl), [`renderFrames()`](/docs/renderer/render-frames#gl), [`getCompositionsOnLambda()`](/docs/lambda/getcompositionsonlambda#gl), [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda#gl) and [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda#gl), you can pass [`chromiumOptions.gl`](/docs/renderer/render-still#gl).

### Via Config file

```tsx twoslash
import { Config } from "@remotion/cli/config";

// ---cut---

Config.setChromiumOpenGlRenderer("angle");
```

:::note
The config file only applies to CLI commands.
:::

:::note
Prior to `v3.3.39`, the option was called `Config.Puppeteer.setChromiumOpenGlRenderer()`.
:::

### Via CLI flag

Pass [`--gl=[angle,swangle,...]`](/docs/cli) in one of the following commands: [`remotion render`](/docs/cli/render), [`remotion compositions`](/docs/cli/compositions), [`remotion still`](/docs/cli/still), [`remotion lambda render`](/docs/lambda/cli/render), [`remotion lambda still`](/docs/lambda/cli/still), [`remotion lambda compositions`](/docs/lambda/cli/compositions).

## See also

- [Using the GPU](/docs/gpu)
