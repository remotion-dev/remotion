---
id: lambda
sidebar_label: Overview
title: "@remotion/lambda"
---

:::warning
**Highly experimental**: APIs might undergo major changes and the framework still has rough edges and hardcoded values - see known issues section. Updates will be provided on the #lambda channel on Discord.

**No release timeline**: The project is in active development but will not be rushed to a release but instead we want to ensure it's futureproof.
:::

## How it works

- A lambda function and a S3 bucket is created on AWS.
- A Remotion project gets deployed to a S3 bucket as a website.
- The lambda function can invoke a render.
- A lot of lambda functions are created in parallel which each render a small part of the video
- The initial lambda function downloads the videos and stitches them together.
- The final video gets uploaded to S3 and is available for download.

## Architecture

- **Lambda function**: Requires a layer with Google Chrome and FFMPEG, is currently pulled from a central S3 bucket. Only one lambda function is required, but it can execute different actions.
- **S3 bucket**: Stores the projects, the renders, render metadata and chunk optimization data.
- **CLI**: Allows to control the overall architecture from the command line. Is installed by adding `@remotion/lambda` to a project.
- **Node.JS API**: Has the same features as the CLI but is easier to use programmatically

## Setup / Installation

[**See here**](/docs/lambda-setup)

## Considerations

Currently hardcoded but you will need to decide in the future:

- Decide memory limit
- Decide lambda timeout
- Decide parallelism
- Decide Region

## Limitations

- You only have 512MB of storage available in lambda function. This must be sufficient for both the chunks and the output, therefore the output file can only be about ~250MB maximum.
- Lambda has a global limit of 1000 concurrent lambdas per region by default, although it can be increased.

## Cost

Will be estimated automatically and added to the progress response. Currently not very accurate/sophisticated.

## Chunk optimization

A mechanism that determines after a render which frames rendered the slowest optimizes the batching sizes for the next render. This can optimize subsequent render times by up to 50%.

## AWS permissions

[**See here**](/docs/lambda-permissions)

## CLI

[**See here**](/docs/lambda-cli)

## Node.JS API

- [calculatePrice()](/docs/calculateprice)
- [deployLambda()](/docs/deployLambda)
- [deployProject()](/docs/deployproject)
- [ensureLambdaBinaries()](/docs/ensurelambdabinaries)
- [getUserPolicy()](/docs/getuserpolicy)
- [getRolePolicy()](/docs/getrolepolicy)
- [getDeployedLambdas()](/docs/getdeployedlambdas)
- [getOrCreateBucket()](/docs/getorcreatebucket)
- [getRenderProgress()](/docs/getrenderprogress)
- [renderVideoOnLambda()](/docs/rendervideoonlambda)
- [simulatePermissions()](/docs/simulatepermissions)

## Known issues

- [ ] There is no cleanup on AWS, unnecessary files stay after the render
- [ ] Sometimes an error `Unable to spawn browser` is shown - you can ignore it
- [ ] Most CLI options known from Remotion are ignored
- [ ] Currently only MP4 files can be rendered
- [ ] AWS permissions are looser than necessary
- [ ] Permission validation command sometimes breaks
- [ ] Chunk optimization currently works on a global scope and does not differentiate between S3 site deployments
- [ ] Costs are not calculated accurately (probably slightly higher than effective)
- [ ] Parallelism is not configurable
- [ ] Rendering using more than 1000 chunks is undefined behavior, things will break
- [ ] `eu-central-1` region is hardcoded
- [ ] 2048 MB RAM is hardcoded
- [ ] Lambda timeout of 120 seconds is hardcoded

## License

The standard Remotion license applies. https://github.com/remotion-dev/remotion/blob/main/LICENSE.md

Companies need to buy 1 cloud rendering seat per 2000 renders per month - see https://companies.remotion.dev/
