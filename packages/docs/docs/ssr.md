---
image: /generated/articles-docs-ssr.png
id: ssr
title: Server-Side Rendering
crumb: "The power of"
sidebar_label: Overview
---

import {TableOfContents} from '../components/TableOfContents/renderer';

Remotion's rendering engine is built with Node.JS, which makes it easy to render a video in the cloud.

## Render a video on AWS Lambda

The easiest and fastest way to render videos in the cloud is to use [`@remotion/lambda`](/docs/lambda).

## Render a video using Node.js APIs

We provide a set of APIs to render videos using Node.js and Bun.  
See an [example](/docs/ssr-node) or the [API reference](/docs/renderer) for more information.

## Render using GitHub Actions

The [Hello World starter template](https://github.com/remotion-dev/template-helloworld) includes a GitHub Actions workflow file [`.github/workflows/render-video.yml`](https://github.com/remotion-dev/template-helloworld/blob/main/.github/workflows/render-video.yml).

<Step>1</Step> Commit the template to a GitHub repository.<br/>
<Step>2</Step> On GitHub, click the <code>Actions</code> tab.<br/>
<Step>3</Step> Select the <code>Render video</code> workflow on the left.<br/>
<Step>4</Step> A <code>Run workflow</code> button should appear. Click it.<br/>
<Step>5</Step> Fill in the props of the root component and click <code>Run workflow</code>. <br/>
<Step>6</Step> After the rendering is finished, you can download the video under <code>Artifacts</code>.<br/><br/>

Note that running the workflow may incur costs. However, the workflow will only run if you actively trigger it.

See also: [Passing input props in GitHub Actions](/docs/parameterized-rendering#passing-input-props-in-github-actions)

## Render a video using Docker

See: [Dockerizing a Remotion project](/docs/docker)

## Render a video using GCP Cloud Run (Alpha)

Check out the experimental [Cloud Run](/docs/cloudrun-alpha) package.

## API reference

<TableOfContents />
