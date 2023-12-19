---
image: /generated/articles-docs-troubleshooting-delay-render-proxy.png
title: "Loading <Img> with src http://localhost:3000/proxy"
sidebar_label: "Loading <Img> with src=http://localhost:3000/proxy..."
crumb: "Troubleshooting"
---

The error message `A delayRender() "Loading <Img> with src=http://localhost:3000/proxy?src=[...]&time=[...]&transparent=[...]" was called but not cleared after 28000ms. See https://remotion.dev/docs/timeout for help`:

```
A delayRender() "Loading <Img> with src=http://localhost:3000/proxy?src=http%3A%2F%2Flocalhost%3A3000%2Fpublic%2Fbackground.mp4&time=683.45&transparent=false" was called but not cleared after 28000ms. See https://remotion.dev/docs/timeout for help
```

occurs when loading an [`<OffthreadVideo>`](/docs/offthreadvideo) and the frame cannot be extracted within the [timeout](/docs/cli/render#--timeout).

To be able to extract a frame, `<OffthreadVideo>` needs to:

- Download the file in full
- Open the file and seek to the correct position
- Decode the frame and convert it into an image

Especially for large files which take some time to download, this error may occur. In order to resolve it, consider increasing the timeout.

You can also [enable verbose logging](/docs/troubleshooting/debug-failed-render) to see the progress of the work that `<OffthreadVideo>` is doing. In the usual case, you can understand from the timings why the timeout occurred.

If you believe this error was triggered by a bug in Remotion, please [open an issue](/docs/get-help).
