---
id: timeout
title: Puppeteer timeout
---

The following error:

```console
TimeoutError: waiting for function failed: timeout 30000ms exceeded
```

generally happens when an unrecoverable error prevented the component to be mounted or if a [`delayRender()`](/docs/delay-render) handle has been created and not been cleared afterwards

## Possible causes

### `continueRender()` was not called

Your code might have a problem where you call `delayRender()` but never clear it. This will cause Remotion to wait forever before it starts rendering and leads to a timeout message.

### ``
