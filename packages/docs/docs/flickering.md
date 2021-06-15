---
id: flickering
title: Flickering
---

If your video flickers during rendering, it is an indication that you have a **multi-threading issue**.

The rendering process of Remotion works as followed:

<img src="/static/img/parallel-rendering.png" />

We open multiple tabs to render the video to speed up the process dramatically. These tabs don't share state and animations that run independent of [`useCurrentFrame()`](/docs/use-current-frame) will break. Frames don't render in order and frames can be skipped.

## Solution

You need to code your video in a way that animations run purely off the value of [`useCurrentFrame()`](/docs/use-current-frame). Think of your component as a function that transforms a frame number into an image. Make sure you check all these boxes:

- [x] Your component should always give the same result when called multiple times.
- [x] Your component should not rely on frames being rendered sequentially.
- [x] Your component should not animate when the video is paused.
- [x] Your component should not rely on randomness - [Exception: `random()`](/docs/random)

## Integrations

Often the problem arises from using other animation techniques than the ones built into Remotion. These techniques animate based off realtime instead of `useCurrentFrame()`. Sometimes we can apply a patch to synchronize other animation techniques with Remotion.

Head over to [**the list of integrations**](/docs/third-party) to see if there is an integration for your animation technique.
