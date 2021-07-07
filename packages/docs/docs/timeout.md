---
id: timeout
title: Puppeteer timeout
---

The following error:

```bash
TimeoutError: waiting for function failed: timeout 30000ms exceeded
```

generally happens when an unrecoverable error prevented the component to be mounted or if a [`delayRender()`](/docs/delay-render) handle has been created and not been cleared afterwards. Puppeteer will wait to make a screenshot, but aborts it after 30 seconds to not hang forever.

## Possible causes

### `continueRender()` was not called

Your code might have a problem where you call [`delayRender()`](/docs/delay-render) but never clear it. This will cause Remotion to wait forever before it starts rendering and leads to a timeout message.

**Resolution**: Check your code and make sure you are calling [`continueRender()`](/docs/continue-render).

### No internet connection or firewall issue

If you rely on network assets such as fonts, images, videos or audio and you don't have internet connection or requests get blocked by a firewall. Special attention has to be given to when you are rendering in the cloud, Amazon VPC could for example block outgoing network requests and lead to a timeout.

**Resolution**: Make sure all network resources you require can be accessed.

### Importing MP4 videos in Chromium

Chrome has the codecs needed for displaying MP4 videos, but Chromium doesn't. If you try to load an MP4 video or an unsupported audio codec in Chromium, it currently leads to a timeout.

**Workaround**: Convert videos to WebM or use Chrome instead of Chromium.

### Memory pressure

When setting the concurrency too high, Chrome might decide to not load some `<Video />`s which can lead to a timeout error.

We consider this a bug in Remotion and plan to fix it in the future.

**Workaround**: Reduce the `concurrency` to a level where Chrome can load all videos.

### Old version of Remotion

Older versions of Remotion had bugs which could lead to timeout.
Especially 1.x releases could timeout when importing large assets

**Resolution**: Upgrade to the latest Remotion version using `npm run upgrade`.

### Not helpful?

[Open an issue](https://github.com/remotion-dev/remotion/issues/new) and try to describe your issue in a way that is reproducible for us. We will try to help you out.

## See also

- [delayRender()](/docs/delay-render)
- [Data fetching](/docs/data-fetching)
