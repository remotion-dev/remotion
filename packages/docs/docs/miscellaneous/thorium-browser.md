---
image: /generated/articles-docs-miscellaneous-thorium-browser.png
sidebar_label: Thorium browser
title: Thorium browser
crumb: "FAQ"
---

Starting from `v4.0.18`, if no local browser can be found, an instance of [Thorium](https://thorium.rocks/) will be downloaded.  
In previous versions, Remotion would download the free version of Chromium, which would not include codecs for the proprietary H.264 and H.265 codecs.
This would often lead to problems when using the [`<Video>`](/docs/video) tag.

Thorium is a free and open-source browser forked off Chromium, which includes the codecs needed to render videos.
The following platforms are supported:

- Linux (x64)
- Windows (x64)
- macOS (x64 and arm64)

If you don't want Thorium to get downloaded or your platform is not supported, you need to specify your own Chromium-based browser:

- Using the [`setBrowserExecutable()`](/docs/config#setbrowserexecutable) option in the config file (for the CLI)
- Using the [`browserExecutable`](/docs/renderer/render-media) option in [`renderMedia()`](/docs/renderer/render-media) and other SSR APIs

In [Lambda](/docs/lambda) and [Cloud Run](/docs/cloudrun), a version of Chrome is already installed, so you don't need to do anything.

## See also

- [Media playback error](/docs/media-playback-error)
