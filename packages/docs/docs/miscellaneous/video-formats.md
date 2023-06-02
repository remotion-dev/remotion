---
image: /generated/articles-docs-miscellaneous-video-formats.png
crumb: "FAQ"
title: Which video formats does Remotion support?
sidebar_label: Video formats
---

Remotion supports a variety of video codecs.

**Output formats**: Videos can be rendered to `H.264` (MP4), `H.265`, (HEVC), `VP8` and `VP9` (WebM), `ProRes` as well as GIFs. See the [Encoding guide](/docs/encoding) for more detail.

**Codecs supported for [`<Video>`](/docs/video):** Remotion uses the default `<video>` tag for playback and therefore inherits codec support from the browser.  
During rendering this means that the Chrome codecs are supported. In the [Remotion Studio](/docs/terminology#remotion-studio) and in the [Player](/docs/terminology#remotion-player), the codec support from the browser in which the webpage is hosted in applies.  
Codec support varies between browsers and changes from time to time. Refer to this [MDN article](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs) for browser support.

**Codecs supported for [`<OffthreadVideo>`](/docs/offthreadvideo)**: The same support that applies to `<Video>` applies to `<OffthreadVideo>` as well, however, more codecs can be supported during rendering since FFmpeg is used under the hood to read the video file. We however don't maintain an exact list of supported video codecs.
