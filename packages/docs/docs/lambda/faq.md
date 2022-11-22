---
sidebar_label: FAQ
title: FAQ
slug: /lambda/faq
---

Some commonly asked questions about Remotion Lambda.

### Is Lambda self-hosted?

Yes, you host Remotion Lambda in your own AWS account. Remotion does not offer a hosted rendering solution at this time.

### Do I need to deploy a function for each render?

No, in general you only need to deploy one function and it will be capable of rendering multiple videos, even across different projects.

There are three exceptions when it is possible to deploy multiple functions:

- If you are using multiple regions, you need to deploy a function for each region.
- If you are upgrading to a newer version of Remotion Lambda, you need to deploy a new function. You can then run the new and the old function side-by-side. The `@remotion/lambda` CLI will always choose the function in your AWS account that has the same version as the client package. If you use the [`getFunctions()`](/docs/lambda/getfunctions) Node.JS API, set the [`compatibleOnly`](/docs/lambda/getfunctions#compatibleonly) flag to `true` to filter out functions that don't match the version of the `@remotion/lambda` package.
- If you are deploying a function with a different memory size, disk size or timeout, a new function can be created. However, currently if multiple suitable functions are available, Remotion will choose one at random. So you should only use this strategy to change the parameters of the function without causing downtime.

### Do I need to create multiple buckets?

Only one bucket per region is required.

### Do I need to deploy multiple sites?

You can deploy one site and use it for as many renders as you need. If you have multiple sites, you can deploy all of them and reuse the same Lambda function.

### What if I want to render longer videos?

You don't need to worry about the timeout of a Lambda function because Remotion splits the video in many parts and renders them in parallel. However, you need to be aware of the storage limits that may not be exceeded. See: [Disk size](/docs/lambda/disk-size)

### Why are you not using Amazon EFS?

We have evaluated Amazon Elastic File System (EFS) and we found the speed benefits of EFS are not substantial enough to warrant the increased complexity - for EFS to be integrated, VPC and security groups need to be created which will disable public internet access. To restore public internet access, a persistent EC2 instance needs to be created for proxying the traffic, negating many benefits of Lambda.

### How much does Remotion Lambda cost?

There are two cost components: The Remotion licensing fee (see [pricing](https://companies.remotion.dev), only applies if you are a company) and the AWS costs. AWS cost is dependant on the amount of memory that you assign to your lambda function. We estimate the Lambda costs for you and report it in the API response.

### How can I upgrade/redeploy a Lambda function?

Remotion will look for a version of the lambda function that matches the Node.JS library / CLI.

If you don't rely on the old function anymore, you can first delete all existing functions:

```bash
npx remotion lambda functions rmall
```

You can deploy a new function using:

```bash
npx remotion lambda functions deploy
```

If you are using the Node.JS APIs, the following APIs are useful: [`getFunctions()`](/docs/lambda/getfunctions), [`deployFunction()`](/docs/lambda/deployfunction) and [`deleteFunction()`](/docs/lambda/deletefunction).

### What the entrypoint of the lambda?

The lambda function handler is in [`lambda/src/functions/index.ts`](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/functions/index.ts).
