---
image: /generated/articles-docs-flickering.png
id: flickering
title: Flickering
crumb: "How to avoid"
---

If your video flickers or suffers from choppiness during rendering, it is an indication that you have a **multi-threading issue**.

The rendering process of Remotion works as follows:

<img src="/img/parallel-rendering.png" />

We open multiple tabs to render the video to speed up the process dramatically. These tabs don't share state and animations that run independent of [`useCurrentFrame()`](/docs/use-current-frame) will break. Frames don't render in order and frames can be skipped.

## Solution

You need to code your video in a way that animations run purely off the value of [`useCurrentFrame()`](/docs/use-current-frame). Think of your component as a function that transforms a frame number into an image. Make sure you check all these boxes:

- [x] Your component should always display the same image when called multiple times.
- [x] Your component should not rely on frames being rendered sequentially.
- [x] Your component should not animate when the video is paused.
- [x] Your component should not rely on randomness - [Exception: `random()`](/docs/random)

## Integrations

Often the problem arises from using other animation techniques than the ones built into Remotion. These techniques animate based off realtime instead of `useCurrentFrame()`. Sometimes we can apply a patch to synchronize other animation techniques with Remotion.

Head over to [**the list of integrations**](/docs/third-party) to see if there is an integration for your animation technique.

## Bypass multithreading

If your animation will not break if the frames are rendered in order, users often use the [`--concurrency=1`](/docs/cli/render#--concurrency) flag. This will fix flickering / choppiness in many cases and is a viable path if the effort of refactoring is too big. The drawback of this technique is that it is way slower and that the correct timing of the animations is still not guaranteed.

## Why Remotion works this way

We commonly get asked if Remotion would consider changing the way how it renders. While we are always have an open ear for how to improve Remotion, the following points need to be considered:

- Rendering speed is of critical importance for many Remotion users, especially those who are relying on server-side rendering. Rendering each frame sequentially would be detrimental for speed, a sacrifice that is not worth it when it's possible to write concurrency-safe videos.

- Setting `--concurrency=1` on a video that would be choppy otherwise does not fully fix the problem. Often the result looks okay only because of coincidence, because the rendering speed is approximately the same as the animation speed. There is no real timing synchronization and results will differ across machines.

- Multithreading is very important for future ideas such as [rendering on AWS Lambda](https://github.com/remotion-dev/remotion/pull/423). Using this integration, you can render a video much faster by rendering it on multiple computers at the same time. All you need for it is a video that is programmed in a concurrency-safe way.
