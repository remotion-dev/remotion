---
image: /generated/articles-docs-lambda-region-selection.png
id: region-selection
title: Region selection
slug: /lambda/region-selection
crumb: 'Lambda'
---

import {LambdaRegionList} from '../../components/lambda/regions.tsx';

Before going live with Remotion Lambda, you need to think about into which AWS region you are deploying your function and bucket.

This document explains how to select a region and which considerations you need to make.

## Available regions

The following AWS regions are available:

<LambdaRegionList />

You can call [`getRegions()`](/docs/lambda/getregions) or type [`npx remotion lambda regions`](/docs/lambda/cli/regions) to get this list programmatically.

:::note
Support for regions `eu-west-3`, `eu-south-1`, `eu-north-1`, `us-west-1`, `af-south-1`, `ap-east-1`, `ap-northeast-2`, `ap-northeast-3`, `ca-central-1`, `me-south-1`, `sa-east-1` has been added in v3.3.7.
:::

## Default region

The default region is `us-east-1`.

## Selecting a region

There are 3 ways to select a region:

- When using the Node.JS APIs, you have to pass the region explicitly to each function. Make sure your projects satisfy the Typescript types or follow the documentation.

- When using the CLI, you can set the region using the `REMOTION_AWS_REGION` environment variable. It's best to put it in a `.env` file so you don't forget it.

:::note
The variable is called `REMOTION_AWS_REGION` because in Cloud providers like Vercel, `AWS_REGION` is a reserved environment variable name. However, Remotion does also accept the latter if you use it locally.
:::

- You can also pass the `--region` flag to all CLI commands to override the region. The flag takes precedence over the environment variable.

:::note
The REMOTION_AWS_REGION environment variable and `--region` flag do not have an effect when using the Node.JS APIs. You need to pass a region explicitly.
:::

If you don't set a region, Remotion will use the default region.

## Which region should I choose?

Different regions have different pricing. Use the following table to get a sense of the pricing differences.

Data may be out of date, please consult the [AWS Lambda Pricing page](https://aws.amazon.com/lambda/pricing/) for the latest information.

| Region         | Price per GB-second |
| -------------- | ------------------- |
| ap-east-1      | 0.0000183000        |
| af-south-1     | 0.0000176800        |
| me-south-1     | 0.0000165334        |
| eu-south-1     | 0.0000156138        |
| ap-south-1     | 0.0000133334        |
| ap-northeast-3 | 0.0000133334        |
| ap-northeast-2 | 0.0000133334        |
| ap-southeast-1 | 0.0000133334        |
| ap-southeast-2 | 0.0000133334        |
| ap-northeast-1 | 0.0000133334        |
| ca-central-1   | 0.0000133334        |
| eu-central-1   | 0.0000133334        |
| eu-west-1      | 0.0000133334        |
| eu-west-2      | 0.0000133334        |
| eu-west-3      | 0.0000133334        |
| eu-north-1     | 0.0000133334        |
| sa-east-1      | 0.0000133334        |
| us-east-1      | 0.0000133334        |
| us-east-2      | 0.0000133334        |
| us-west-1      | 0.0000133334        |
| us-west-2      | 0.0000133334        |

Previously, this section mentioned differences in the amount of concurrent lambdas that can be run in a region. This is no longer the case.

## Enabling regions in the AWS console

Some regions that are supported by Remotion are not enabled by default in an AWS account. If you get a message:

```
The security token included in the request is invalid
```

see [here](/docs/lambda/troubleshooting/security-token)

## Other considerations

- The function and S3 bucket must be in the same region to eliminate latency across datacenters. Rendering with functions and buckets that have mismatching regions is not supported

- You may deploy your whole architecture to different regions to further increase the amount of renders you can make concurrently. This has the advantage of higher redundancy, but a potential drawback of hitting a non-warm function.

- Some regions are more expensive than others (for example `af-south-1`).
  Consult the [Lambda Pricing page](https://aws.amazon.com/lambda/pricing/) from AWS.

- Some regions [are disabled by default](https://docs.aws.amazon.com/general/latest/gr/rande-manage.html) and you need to enable them in your AWS account before you can use them.
