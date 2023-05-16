---
image: /generated/articles-docs-cloudrun.png
id: cloudrun
sidebar_label: Overview
title: "@remotion/cloudrun"
---

Render Remotion videos on [GCP Cloud Run](https://cloud.google.com/run).

import {GcpRegionList} from '../components/cloudrun/regions.tsx';

## When should I use it?

- You are fine with using Google Cloud Platform in one of the [supported regions](/docs/cloudrun/region-selection).

If one of those constraints is a dealbreaker for you, resort to normal [server-side rendering](/docs/ssr).

## How it works

### Deployment

- Any time a new version of Remotion is published by the Remotion team, a new image will be uploaded to a publicly readable artifact registry in GCP.
- When you deploy a new Cloud Run service to your GCP Project, it will by default download the latest image from the repository. If you require a specific version, you can specify that in the command.

### Rendering

- A Cloud Run service and a Cloud Storage bucket are created in GCP.
- A Remotion project gets deployed to a Cloud Storage bucket as a website.
- The Cloud Run service gets invoked and opens the Remotion project.
- The Cloud Run service renders the video or still, and the final video gets uploaded to Cloud Storage and is available for download.

## Architecture

- **Cloud Run service**: Contains the required libraries and binaries for rendering Remotion projects, and is available for invoking behind a URL.
- **Cloud Storage bucket**: Stores the projects, the renders, and render metadata.
- **CLI**: Allows control of the overall architecture from the command line. Is installed by adding `@remotion/cloudrun` to a project.
- **Node.JS API**: Has the same features as the CLI but is easier to use programmatically.

## Setup / Installation

[**See here**](/docs/cloudrun/setup)

## Region selection

The following regions are available for Remotion Cloud Run:

<GcpRegionList />

[**See here for configurations and considerations.**](/docs/cloudrun/region-selection)

## Limitations

- You only have up to 10GB of storage available in a Lambda function. This must be sufficient for both the separated chunks and the concatenated output, therefore the output file can only be about 5GB maximum, limiting the maximum video length to around 2 hours of Full HD video.
- [Lambda has a global limit of 1000 concurrent lambdas per region by default, although it can be increased](/docs/lambda/troubleshooting/rate-limit).
- Lambda has a [burst limit of as low as 500](https://docs.aws.amazon.com/lambda/latest/dg/invocation-scaling.html) (depending per region) functions that can be spawned in a short amount of time. If you render a lot of videos, you must slowly build up invocations rather than trigger them all at once.

## Cost

Most of our users render multiple minutes of video for just a few pennies. The exact cost is dependent on the region, assigned memory, type of video and other parameters. For each render, we estimate a cost and display it to you. You might also need a Remotion license (see below).

## GCP permissions

Remotion Cloud Run requires you to create a GCP project and create a Service Account with some permissions attached to it. We require only the minimal amount of permissions required for operating Remotion Cloud Run.

// TODO: Create doc link to permissions

## CLI

You can control Remotion Cloud Run using the `npx remotion cloudrun` command.

[**Read more about the CLI**](/docs/cloudrun/cli)

## Node.JS API

// TODO: Link to API reference
Everything you can do using the CLI, you can also control using Node.JS APIs. See the reference [here](#).

## License

The standard Remotion license applies. https://github.com/remotion-dev/remotion/blob/main/LICENSE.md

Companies need to buy 1 cloud rendering seat per 2000 renders per month - see https://companies.remotion.dev/

## Uninstalling

We make it easy to remove all Remotion resources from your GCP account without leaving any traces or causing further costs.

// TODO: Link to uninstall page
