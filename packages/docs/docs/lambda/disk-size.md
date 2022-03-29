---
id: disk-size
title: Disk size
---

By default, each Lambda function comes with an ephemereal disk size of 512MB. This is enough storage to render a video of approximately 8 minutes of Full HD video.

If you want to render longer videos, you can increase the disk size, and [potentially also increase the timeout](/docs/timeout).

Disk space need increases linearly with the length of your video, meaning that for each 8 minutes of Full HD video, you approximately need another 512MB of video.

The minimum disk size is 512MB, and the maximum disk size is 10240MB.
