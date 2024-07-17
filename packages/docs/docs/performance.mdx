---
image: /generated/articles-docs-performance.png
id: performance
sidebar_label: Performance
title: Performance Tips
crumb: "Need for Speed"
---

Video rendering is one of the most heavy workloads a computer can take on. Remotion aims to at least perform similarly than traditional video editing programs.

Your experience is also dependent on your code and the hardware you run it on. Review the following performance insights to find opportunities for speeding up your render.

## Concurrency

The `--concurrency` flag you set can influence the rendering speed both positively and negatively. A concurrency too high and a concurrency too low can both be coutnerproductive. Use the [`npx remotion benchmark`](/docs/cli/benchmark) command to find the optimal concurrency.

## GPU effects

The following elements use the GPU:

- WebGL content (Three.JS, Skia, P5.js, Mapbox etc.)
- 2D Canvas graphics
- GPU-accelerated CSS properties such as `box-shadow`, `text-shadow`, `background-image: linear-gradient()`, `background-image: radial-gradient()`, `filter: blur()`, `filter: drop-shadow()`

Compute instances in the cloud do not have a GPU and may take a long time to render these effects, leading to bottlenecks.

Consider replacing those effects with a precomputed image for the best performance.

Read the [considerations about using the GPU](/docs/gpu).

## Videos

For embedding videos, there is an alternative component [`<OffthreadVideo>`](/docs/offthreadvideo) that can speed up rendering. See [`<Video>` vs. `<OffthreadVideo>`](/docs/video-vs-offthreadvideo)

Embedded videos can be a significant bottleneck in Remotion at the moment regardless of which component is being used. We are aware of this constraint and are encouraging users to combine Remotion with other tools such as FFmpeg to build efficient pipelines.

We are also working on alleviating this problem by making the `<OffthreadVideo>` component more efficent in a future update.

## Slow JavaScript code

Remotion can also suffer from JavaScript bottlenecks that are introduced in your code. [Debug your render and log timing information](/docs/troubleshooting/debug-failed-render) to find slow parts of your code.

Use memoization using [`useMemo()`](https://react.dev/reference/react/useMemo) and [`useCallback()`](https://react.dev/reference/react/useCallback) where appropriate to cache expensive computation.

## Data fetching

[Measure](/docs/troubleshooting/debug-failed-render) the impact of fetching external resources, probe for overfetching and attempt to minimize the fetching of external data.

Use caching in Local storage if possible to reduce time spent on networking.

## Codec settings

- If you set the image format `png`, it is slower than `jpeg`. However `png` is required if you are rendering a transparent video.
- The WebM codecs `vp8` and `vp9` are very slow at encoding due to stronger compression.

See also the [Encoding guide](/docs/encoding) to see all tradeoffs when it comes to encoding speed.

## Resolution

Higher resolutions will make the render slower. If you can live with a lower resolution, scale down the picture using [`--scale`](/docs/cli/render#--scale)

## Considerations for Lambda

See [this article](/docs/lambda/optimizing-speed) for tips specifically for Lambda.

## Measuring render speed

- Render using [`--log=verbose`](/docs/troubleshooting/debug-failed-render) to list the slowest frames of a Remotion render. Consider that the first frames rendered in a thread might be slow due to initalization.

- Use `console.time` to measure how long an operation takes in your code in order to find the slow parts of your render.

- Use [`npx remotion benchmark`](/docs/cli/benchmark) to try out different values for `--concurrency` to find the optimal value.

## See also

- [Lambda: Optimizing for speed](/docs/lambda/optimizing-speed)
