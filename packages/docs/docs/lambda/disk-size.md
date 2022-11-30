---
image: /generated/articles-docs-lambda-disk-size.png
id: disk-size
title: Disk size
crumb: "Lambda"
---

By default, each Lambda function comes with an ephemereal disk size of 2048MB. This is enough storage to render a video of approximately 32 minutes of Full HD video.

If you want to render longer videos, you can increase the disk size, and [potentially also increase the timeout](/docs/timeout).

Disk space need increases linearly with the length of your video, meaning that for each 8 minutes of Full HD video, you approximately need another 512MB of video.

The minimum disk size is 512MB, and the maximum disk size is 10240MB.

The approximate maximum video duration length is therefore around ~160 minutes at Full HD (not yet practically confirmed).

| Disk size         | Approximate Maximum video length |
| ----------------- | -------------------------------- |
| 512 MB            | 8 min - 1080p                    |
| 1024 MB           | 16 min - 1080p                   |
| 2048 MB (default) | 32 min - 1080p                   |
| 4096 MB           | 1h 4min - 1080p                  |
| 8192 MB           | 2h 8min - 1080p                  |
| 10240 MB          | 2h 40min - 1080p                 |

> These are approximate values and will not exactly match your scenario. Video output size is dependant on the video content and audio. Measure and find the values that work best for you.

## Setting the disk size

- Use the [`diskSizeInMb` option of `deployFunction()`](/docs/lambda/deployfunction#disksizeinmb) to set the disk size when you deploy.
- Use the [`--disk`](/docs/lambda/cli/functions) flag if you use the `remotion lambda functions deploy` command.

## Pricing

Using more disk space costs more. See the [Lambda pricing page](https://aws.amazon.com/lambda/pricing/) "Lambda Ephemereal Storage Pricing" section for pricing.  
The [`estimatePrice()`](/docs/lambda/estimateprice) API does also factor disk size into account.
