---
image: /generated/articles-docs-ffmpeg.png
title: Installing FFmpeg
sidebar_label: Installing FFmpeg
crumb: "(you don't have to)"
---

:::info
Since Remotion v4.0, Remotion comes bundled with a lightweight version of FFmpeg. An installation of FFmpeg is no longer needed.
:::

## FFmpeg in V3 of Remotion

**The following documentation is an archival for how FFmpeg worked in v3.0.**

Remotion requires FFmpeg to encode videos. Since v3.3, you do not need to install FFmpeg manually. This page documents the behavior of Remotion for developers needing advanced control.

### `ffmpeg` and `ffprobe`

Two binaries are required for Remotion: `ffmpeg` and `ffprobe`. When talking about FFmpeg in the documentation, it may also refer to FFprobe.

### Auto-install

When rendering a video and binaries are not found, Remotion will download them from the internet and put it inside your `node_modules` folder. The binary will not get added to your `PATH`, so if you type in `ffmpeg` into your Terminal, it may not be found. However, Remotion will be able to use it

#### Supported architectures

Auto-install is supported on the following platforms:

- Linux, x86_64,
- macOS, Intel
- macOS, Apple Silicon
- Windows, x86_64

For other platforms, you need to supply your own binaries.

#### Triggering auto-install

By rendering a video, the download of FFmpeg will be triggered automatically.

On servers, it might be of use to install the binaries before the first render, so no time is wasted once the first render begins.

- Using the CLI, you can run [`npx remotion install ffmpeg`](/docs/cli/install) and `npx remotion install ffprobe` to trigger auto-install of binaries. If the binaries exist, the command will do nothing. This requires `@remotion/cli` to be installed.
- The [`@remotion/renderer`](/docs/renderer) package exposes [`ensureFfmpeg()`](/docs/renderer/ensure-ffmpeg) and [`ensureFfprobe()`](/docs/renderer/ensure-ffprobe) functions

### Order of priority

In case of multiple binaries being supplied, they priority order is the following:

- If a binary was supplied using the `ffmpegExecutable` or `ffprobeExecutable` option, it will be used.
- If `ffmpeg` or `ffprobe` is in the `PATH`, it will be used.
- If a binary was previously installed by Remotion into `node_modules`, it will be used.
- If a binary can be downloaded from the internet, Remotion will do so and use it.
- Failure if no binary was found using the logic above.
