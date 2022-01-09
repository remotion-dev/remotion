---
id: lambda
sidebar_label: Overview
title: "@remotion/lambda"
---

Render Remotion videos on [AWS Lambda](https://aws.amazon.com/lambda/). This is the fastest, most cost-efficient and most scalable way to render Remotion videos.

import {LambdaRegionList} from '../components/lambda/regions.tsx';

:::warning
**Beta**: APIs might undergo minor changes. Updates will be provided on the #lambda channel on Discord.

**No release timeline**: The project is in active development but will not be rushed to a release but instead we want to ensure it's futureproof.
:::

## When should I use it?

- Your videos are less than 8 minutes long. <sub>(AWS Lambda storage constraint)</sub>
- You are rendering less than 1 hour of video per minute. <sub>(AWS Lambda Burst Limit / Concurrency constraint)</sub>
- You are fine with using Amazon Web Services in one of the [supported regions](/docs/lambda/region-selection).

If one of those those constraints is a dealbreaker for you, resort to normal [server-side rendering](/docs/ssr).

## How it works

- A Lambda function and a S3 bucket is created on AWS.
- A Remotion project gets deployed to a S3 bucket as a website.
- The lambda function can invoke a render.
- A lot of lambda functions are created in parallel which each render a small part of the video
- The initial lambda function downloads the videos and stitches them together.
- The final video gets uploaded to S3 and is available for download.

## Architecture

- **Lambda function**: Requires a layer with Chromium and FFMPEG, currently hosted by Remotion. Only one lambda function is required, but it can execute different actions.
- **S3 bucket**: Stores the projects, the renders, render metadata and chunk optimization data.
- **CLI**: Allows to control the overall architecture from the command line. Is installed by adding `@remotion/lambda` to a project.
- **Node.JS API**: Has the same features as the CLI but is easier to use programmatically

## Setup / Installation

[**See here**](/docs/lambda/setup)

## Region selection

The following regions are available for Remotion Lambda:

<LambdaRegionList />

[**See here for configurations and considerations.**](/docs/lambda/region-selection)

## Limitations

- You only have 512MB of storage available in lambda function. This must be sufficient for both the chunks and the output, therefore the output file can only be about ~250MB maximum.
- Lambda has a global limit of 1000 concurrent lambdas per region by default, although it can be increased.

## Cost

Most of our users render multiple minutes of video for just a few pennies. The exact cost is dependent on the region, assigned memory, type of video, parallelization and other parameters. For each render, we estimate a cost and display it to you. You might also need a Remotion license (see below).

## Chunk optimization

A mechanism that determines after a render which frames rendered the slowest optimizes the batching sizes for the next render. This can optimize subsequent render times by up to 50%.

[**Read more about chunk optimization**](/docs/lambda/chunk-optimization)

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
