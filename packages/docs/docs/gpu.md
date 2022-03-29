---
id: gpu
title: Using the GPU
sidebar_label: Using the GPU
---

Some types of content in Remotion can benefit from a GPU being available on the machine that is used for rendering. That is:

- WebGL content (Three.JS, P5.js, Mapbox etc.)
- 2D Canvas graphics
- GPU-accelerated CSS properties such as `filter: blur()`

If a GPU is available, it should be enabled by default while rendering the preview. However, in headless mode, Chromium disables the GPU, leading to a significant
slowdown in rendering time.

## The way forward: Chrome 98

In Chrome 98 (scheduled for release in February 2022), the GPU can be used in headless mode. Testing a Chromium build that is compiled from source, we found that a video rendered on a `<canvas>` on macOS content is many times faster than in the stable version of Chrome.

We will continue to observe this area and update this document with our findings and share best practices.

## Considerations

For rendering content that can benefit from a GPU, you might want to choose a cloud rendering solution to which a GPU can be attached to over AWS Lambda (which does not have a GPU). Most bigger cloud providers have some GPU-enabled VPS offerings. Apple M1 VPS instances might also be able to accelerate graphics rendering and be more economical than VPS instances with desktop graphic cards.

Note that to realize these gains, the Chrome update has yet to arrive. We have not yet done any testing in the cloud.

## Software emulation

You can still render all types of content without having a GPU, it will just be slower.
The graphics content will be software-emulated using [ANGLE](https://github.com/google/angle) or [SwiftShader](https://github.com/google/swiftshader) (when using Lambda).

## What are your experiences?

We'd love to learn and document more findings about the GPU. Let us know and we will amend this document!
