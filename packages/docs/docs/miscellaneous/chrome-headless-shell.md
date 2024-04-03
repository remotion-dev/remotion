---
image: /generated/articles-docs-miscellaneous-chrome-headless-shell.png
sidebar_label: Chromium Headless Shell
title: Chrome Headless Shell
crumb: "FAQ"
---

Remotion will download [Chrome Headless Shell](https://developer.chrome.com/blog/chrome-headless-shell) if no local browser can be found and an API for rendering videos is used.

The following platforms are supported:

- Linux (x64)
- Windows (x64)
- macOS (x64 and arm64)

If you don't want Chrome Headless Shell to get installed or your platform is not supported, you need to specify your own Chromium-based browser:

- Using the [`setBrowserExecutable()`](/docs/config#setbrowserexecutable) option in the config file (for the CLI)
- Using the [`browserExecutable`](/docs/renderer/render-media) option in [`renderMedia()`](/docs/renderer/render-media) and other SSR APIs

In [Lambda](/docs/lambda) and [Cloud Run](/docs/cloudrun), a version of Chrome is already installed, so you don't need to do anything.

## For versions v4.0.18 - v4.0.135

In these versions, if no local browser can be found, an instance of [Thorium](https://thorium.rocks/) is downloaded.

Thorium is a free and open-source browser forked off Chromium, which includes the codecs needed to render videos.

## Versions before v4.0.18

In previous versions, Remotion would download the free version of Chromium, which would not include codecs for the proprietary H.264 and H.265 codecs.
This would often lead to problems when using the [`<Video>`](/docs/video) tag.

## See also

- [Media playback error](/docs/media-playback-error)
