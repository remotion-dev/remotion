---
image: /generated/articles-docs-lambda-runtime.png
id: runtime
title: Runtime
slug: /lambda/runtime
crumb: 'Lambda'
---

import {DefaultMemorySize} from '../../components/lambda/default-memory-size';
import {DefaultTimeout} from '../../components/lambda/default-timeout';

This page describes the environment that the Lambda function is running in.

## Node.JS Version

| Remotion Version | Node.js Release Line | Locked Runtime ARN                                                                                  |
| ---------------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| From v4.0.415    | 24.x                 | `arn:aws:lambda:{region}::runtime:58a37e8413ed69058c4ac3b1df642118591f17d40def93d6101f867c72cd03c2` |
| From v4.0.379    | 20.x                 | `arn:aws:lambda:{region}::runtime:da57c20c4b965d5b75540f6865a35fc8030358e33ec44ecfed33e90901a27a72` |
| From v4.0.376    | 22.x                 | `arn:aws:lambda:{region}::runtime:bbff6dbb70f7ec465eee20d07035db8b2d55506273cd6188d5bf1123c218e508` |
| From 4.0.246     | 20.x                 | `arn:aws:lambda:{region}::runtime:da57c20c4b965d5b75540f6865a35fc8030358e33ec44ecfed33e90901a27a72` |
| Before v4.0.245  | 18.x                 | -                                                                                                   |

Currently Remotion Lambda continues to use the 20.x runtime since instability was experienced with higher versions.

If your [user policy](/docs/lambda/permissions#user-policies) includes `lambda:PutRuntimeManagementConfig` (included by default if you set up Remotion Lambda after November 2023), the Lambda runtime will be locked to the ARN shown for your Remotion version (recommended).

Otherwise, future updates to the runtime by AWS have the potential to break the function.
If you don't have this permission in your policy, a warning will be printed.

## Memory size

The default is <DefaultMemorySize/> MB. You can configure it by passing an argument to [`deployFunction()`](/docs/lambda/deployfunction) or by passing a `--memory` flag to the CLI when deploying a function.

## Timeout

The default is <DefaultTimeout /> seconds. You can configure it when calling [`deployFunction()`](/docs/lambda/deployfunction) or by passing a `--timeout` flag to the CLI when deploying a function.

Note that you probably don't need to increase it - Since the video is rendered by splitting it into many parts and those parts are rendered in parallel, there are rare cases where you need more than <DefaultTimeout /> seconds.

## Storage space

The function has between [512MB and 10GB of storage space](/docs/lambda/disk-size) in total available for video rendering depending on your configuration. Keep in mind that the concatenations of various chunks into one video takes place within a Lambda function, so the space must suffice for both the chunks and the output video.

## Core count / vCPUs

The amount of cores inside a Lambda is dependent on the amount of memory you give it. According to [this research](https://web.archive.org/web/20230331040434/https://www.sentiatechblog.com/aws-re-invent-2020-day-3-optimizing-lambda-cost-with-multi-threading), these are the tiers:

| Memory         | vCPUs |
| -------------- | ----- |
| 128 - 3008 MB  | 2     |
| 3009 - 5307 MB | 3     |
| 5308 - 7076 MB | 4     |
| 7077 - 8845 MB | 5     |
| 8846+ MB       | 6     |

You can render multiple frames at once inside a Lambda function by using the [`concurrencyPerLambda`](/docs/lambda/rendermediaonlambda#concurrencyperlambda) option.

## Chrome

The function already includes a running version of Chrome.
The browser was compiled including the proprietary codecs, so you can include MP4 videos into your project.

| Remotion version | Chrome version |
| ---------------- | -------------- |
| From 4.0.415     | 144.0.7559.20  |
| From 4.0.274     | 133.0.6943.141 |
| From 4.0.245     | 123.0.6312.86  |
| From 4.0.0       | 114.0.5731.1   |
| From 3.2.0       | 104.0.5112.64  |
| From 3.0.8       | 101.0.4951.68  |
| From 3.0.0       | 98.0.4758.139  |

## FFmpeg

The FFmpeg which is built into `@remotion/renderer` is being used on Lambda.

## Fonts

The function includes the following fonts:

- Noto Color Emoji
- Noto Sans Black
- Noto Sans Bold
- Noto Sans Regular
- Noto Sans SemiBold
- Noto Sans Thin
- Noto Sans Arabic Regular
- Noto Sans Devanagari Regular
- Noto Sans Hebrew Regular
- Noto Sans Tamil Regular
- Noto Sans Thai Regular

Since December 2021 the following fonts are also available **only on the `arm64` version of Remotion Lambda:**

- Noto Sans Simplified Chinese Regular
- Noto Sans Simplified Chinese Bold
- Noto Sans Traditional Chinese Regular
- Noto Sans Traditional Chinese Bold
- Noto Sans Korean Regular
- Noto Sans Korean Bold
- Noto Sans Japanese Regular
- Noto Sans Japanese Bold

If you'd like to use different fonts, we recommend using Webfonts.

While the set of default fonts that we can include must be kept small in order to save space, we are happy to hear feedback if you encounter a scenario where characters cannot be rendered.

## Customize layers

See: [Customize Lambda layers](/docs/lambda/custom-layers) to learn about how you can customize this stack.

## See also

- [Customize Lambda layers](/docs/lambda/custom-layers)
