---
id: performance
title: Performance Tips
---

Video rendering is one of the most heavy workloads a computer can take on. Remotion aims to at least perform similarly than traditional video editing programs. This section describes several aspects that influence render speed that you can influence.

## Increase concurrency

By default, Remotion will use half of the threads available on the system to perform rendering. [You can increase the default concurrency to use up to all of your threads](https://www.remotion.dev/docs/cli). This will most likely increase render speed but might slow down other operations on your computer.

:::info
Most Intel and AMD CPUs have hyperthreading, which means that per CPU core you get 2 threads. So for example, if you have an 8-core CPU, you have 16 threads, which means that the maximum concurrency that Remotion supports is 16.
:::

## Decrease concurrency

Too much concurrency can also lead to the render being overloaded and causing Chrome to throttle the render. The art is to find the value for concurrency that works best for you, for example using the [`npx remotion benchmark`](/docs/cli/benchmark) command.

## Decrease remote load

Loading data from remote sources, such as making an API call, loading an image, video, or audio file from a remote location will increase the render time because Remotion has to wait until the data is fetched. Try to move assets to your local machine or cache API requests (for example in `localStorage`) to speed up Remotion rendering.

## Decrease image resolution

Generally, lower resolution frames result in faster renders. You can make the dimensions smaller while in development and rendering test files, and apply a `scale` transformation to the composition to move faster initially, and then render at full resolution later.

## Choose the right image format and codec

[JPEG rendering is faster](/docs/config#setimageformat) than PNG rendering. [H264 is the fastest way](/docs/encoding) to encode frames into a video. If you have deviated from the defaults, consider them again if you see slow rendering.

## Enable GPU acceleration

For Three.JS content and other content that benefits from GPU acceleration, you should enable the [`--gl=angle`](/docs/chromium-flags#--gl) flag. See: [Using the GPU](/docs/gpu)
