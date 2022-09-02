---
id: lambda
sidebar_label: Overview
title: "@remotion/lambda"
---

Render Remotion videos on [AWS Lambda](https://aws.amazon.com/lambda/). This is the fastest, most cost-efficient and most scalable way to render Remotion videos.

import {LambdaRegionList} from '../components/lambda/regions.tsx';

## When should I use it?

- You are rendering less than 1 hour of video per minute. <sub>([AWS Lambda Concurrency Limit / Burst Limit constraint](/docs/lambda/troubleshooting/rate-limit))</sub>
- Your videos are less than 2 hours long. <sub>([AWS Lambda storage constraint](/docs/lambda/disk-size))</sub>
- You are fine with using Amazon Web Services in one of the [supported regions](/docs/lambda/region-selection).

If one of those constraints is a dealbreaker for you, resort to normal [server-side rendering](/docs/ssr).

## How it works

- A Lambda function and a S3 bucket is created on AWS.
- A Remotion project gets deployed to a S3 bucket as a website.
- The Lambda function gets invoked and opens the Remotion project.
- A lot of Lambda functions are created in parallel which each render a small part of the video
- The initial Lambda function downloads the videos and stitches them together.
- The final video gets uploaded to S3 and is available for download.

## Architecture

- **Lambda function**: Requires a layer with Chromium and FFMPEG, currently hosted by Remotion. Only one Lambda function is required, but it can execute different actions.
- **S3 bucket**: Stores the projects, the renders, and render metadata.
- **CLI**: Allows to control the overall architecture from the command line. Is installed by adding `@remotion/lambda` to a project.
- **Node.JS API**: Has the same features as the CLI but is easier to use programmatically

## Setup / Installation

[**See here**](/docs/lambda/setup)

## Region selection

The following regions are available for Remotion Lambda:

<LambdaRegionList />

[**See here for configurations and considerations.**](/docs/lambda/region-selection)

## Limitations

- You only have up to 10GB of storage available in a Lambda function. This must be sufficient for both the separated chunks and the concatenated output, therefore the output file can only be about 5GB maximum, limiting the maximum video length to around 2 hours of Full HD video.
- [Lambda has a global limit of 1000 concurrent lambdas per region by default, although it can be increased](/docs/lambda/troubleshooting/rate-limit).
- Lambda has a [burst limit of as low as 500](https://docs.aws.amazon.com/lambda/latest/dg/invocation-scaling.html) (depending per region) functions that can be spawned in a short amount of time. If you render a lot of videos, you must slowly build up invocations rather than trigger them all at once.

## Cost

Most of our users render multiple minutes of video for just a few pennies. The exact cost is dependent on the region, assigned memory, type of video, parallelization and other parameters. For each render, we estimate a cost and display it to you. You might also need a Remotion license (see below).

## AWS permissions

Remotion Lambda requires you to create an AWS account and create a user with some permissions attached to it. We require only the minimal amount of permissions required for operating Remotion Lambda.

[**Read more about permissions**](/docs/lambda/permissions)

## CLI

You can control Remotion Lambda using the `npx remotion lambda` command.

[**Read more about the CLI**](/docs/lambda/cli)

## Node.JS API

Everything you can do using the CLI, you can also control using Node.JS APIs. Refer to the left sidebar to see the list of available APIs.

## License

The standard Remotion license applies. https://github.com/remotion-dev/remotion/blob/main/LICENSE.md

Companies need to buy 1 cloud rendering seat per 2000 renders per month - see https://companies.remotion.dev/

## Uninstalling

We make it easy to remove all Remotion resources from your AWS account without leaving any traces or causing further costs.

[**How to uninstall Remotion Lambda**](/docs/lambda/uninstall)
