---
image: /generated/articles-docs-gpu.png
id: gpu
title: Using the GPU
sidebar_label: Using the GPU
crumb: "Need for Speed"
---

Some types of content in Remotion can benefit from a GPU being available on the machine that is used for rendering. That is:

- WebGL content (Three.JS, Skia, P5.js, Mapbox etc.)
- 2D Canvas graphics
- GPU-accelerated CSS properties such as `box-shadow`, `filter: blur()` and `filter: drop-shadow`

If a GPU is available, it should be enabled by default while in the Remotion Studio or Remotion Player. However, in headless mode, Chromium disables the GPU, leading to a significant
slowdown in rendering time.

## Use `--gl=angle` for local renders

Since Chrome 98, the GPU can be used in headless mode. Adding `--gl=angle` (or `{chromiumOptions: {gl: "angle"}}` for the Node.JS APIs), we find that a video rendered on a `<canvas>` on macOS is many times faster compared to rendering without the flag.

However, there seems to be memory leak from Chrome that may kill a long render, therefore we don't set `angle` as default. We recommend to render long videos that use the GPU in multiple parts.

## Use `--gl=swangle` for Lambda

Since Lambda does not have a GPU, the content has to be rendered using software. You can still render all types of content without having a GPU, it will just be slower. The best way to do so is by passing `--gl=swangle` if you are rendering using the CLI, or passing `{chromiumOptions: {gl: "swangle"}}` if using the Node.JS APIs.

## Considerations

For rendering content that can benefit from a GPU, you might want to choose a cloud rendering solution to which a GPU can be attached to over AWS Lambda (which does not have a GPU). Most bigger cloud providers have some GPU-enabled VPS offerings. Apple M1 VPS instances might also be able to accelerate graphics rendering and be more economical than VPS instances with desktop graphic cards.

## Using the GPU on Lambda

AWS Lambda instances have no GPU, so it is not possible to use it.

## What are your experiences?

We'd love to learn and document more findings about the GPU. Let us know and we will amend this document!
