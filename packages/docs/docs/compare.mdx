---
image: /generated/articles-docs-compare.png
id: compare-ssr
title: Comparison of server-side rendering options
sidebar_label: Comparison of SSR options
crumb: 'Compare'
---

This page compares 4 options for rendering videos in the cloud:

- [Remotion Lambda](/docs/lambda)
- [Vercel Sandbox](/docs/vercel-sandbox)
- [Cloud Run](/docs/cloudrun)
- [Node.JS/Bun APIs](/docs/renderer)

These options are deliberately distinct with different tradeoffs, so that you can choose the one that best fits your use case.

## Overall recommendation

We recommend Remotion Lambda for most people as it has the best tradeoff for speed, ease of setup, maturity, total cost and scalability.

If you are already a Vercel customer and want the simplest setup, [Vercel Sandbox](/docs/vercel-sandbox) is a great choice.

The Remotion customers with the highest amount of videos rendered use the Remotion Lambda solution.

## Speed

Remotion Lambda is the fastest option, because it implements distributed rendering - the video gets divided into smaller chunks and rendered in parallel across multiple Lambda functions.

Vercel Sandbox, Cloud Run, and custom servers do not support distributed rendering, so rendering happens on one physical machine.

Vercel Sandbox currently has longer cold starts due to VM provisioning, installing system dependencies and downloading a browser on each render. We plan to improve this with Vercel Sandbox snapshots.

Implementing a custom distributed rendering solution from scratch is challenging and we do not yet provide documentation.

## Cost

Compute on Remotion Lambda is more expensive than other options.
However, costs are only incurred when you actually render videos.
Depending on the amount of videos you render, the total cost might be lower or higher with Lambda.

Vercel Sandbox pricing is based on usage. You only pay for the time the VM is running. See [Vercel Sandbox pricing](https://vercel.com/docs/vercel-sandbox/pricing) for details.

Cloud Run is cheaper than Lambda because there is no distributed rendering and no overhead that comes with it.
You also don't pay for the time that the Cloud Run instance is idle.

Running a server has by far the cheapest compute cost.
However, you also pay for the time that the server is idle.

Conclusion: The more videos you render, the more a long-running server might be worth for you.

## Ease of setup

Vercel Sandbox is the easiest to set up. You only need a Vercel account and a Blob store. Push to deploy.

Remotion Lambda and Cloud Run are also fast to set up.
Remotion Lambda is built into our SaaS templates, so you can get started very quickly.

Using the Node.JS APIs requires you to set up a server yourself and manage certain things yourself:

- Queueing renders
- Dealing with a spike in traffic
- Progress reporting and error handling
- Setting up logging
- Provisioning of servers

This is a big effort overall and is only recommended for teams who are committed to using Remotion and want the most flexibility.

## Feature set

Remotion Lambda currently has the following features that Cloud Run does not have:

- Distributed rendering
- Webhooks
- Apple Emoji
- Polling progress
- Cost estimation
- Renders with expiration date
- Rendering from PHP, Go and Python

Rendering with Vercel Sandbox or the Node.JS APIs does not come with these features either, but you may build them based on top of the low-level APIs that are provided.

## GPU

Most renders do not become faster with GPU acceleration. See: [Which content benefits from a GPU?](/docs/gpu).

We have guides for configuring [a server with GPU acceleration](/docs/miscellaneous/cloud-gpu), but it is not yet supported by Remotion.

Remotion Lambda and Vercel Sandbox do not have GPUs. You are limited to CPU-only rendering.

We have not tested Cloud Run with GPU acceleration. It is possible add a GPU to the Cloud Run instance - we are curious to hear your feedback.

## Stability

We are happy with the architecture of Remotion Lambda and Node.js APIs and are committed to it in the long-term.

Vercel Sandbox support is new. We are actively improving it with planned features like snapshots for faster cold starts and custom Chrome builds for better codec support.

Cloud Run is in Alpha and we are considering moving it to a model which re-uses the code of Remotion Lambda.
This would allow us to better match the features of Remotion Lambda and enable distributed rendering.

Currently, the development of Cloud Run is hindered because a new Docker image needs to be built for each change, making testing slow.
Therefore, we are currently only making essential changes to the current Cloud Run product.
