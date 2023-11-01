---
image: /generated/articles-docs-lambda-insights.png
sidebar_label: Insights
title: Enable Lambda Insights
crumb: "Lambda"
---

# Enable Lambda Insights<AvailableFrom v="4.0.61"/>

You may enable [AWS Lambda Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights.html) for your Remotion Lambda function.

## Prerequisites

<Step>1</Step> Ensure you are on at least Remotion v4.0.61. <br/>
<Step>2</Step> If you started using Remotion before v4.0.61, update both your <a href="/docs/lambda/permissions#user-permissions">AWS user permission</a> and <a href="/docs/lambda/permissions#role-permissions">AWS role permission</a>, since now more permissions are needed.

## Enable Lambda Insights

**Via CLI**:

```
npx remotion lambda functions deploy --enable-lambda-insights
```

If the function already existed before, you need to delete it beforehand.

**Via Node.js APIs:**

```tsx twoslash title="deploy.ts" {8, 11-13}
// @module: ESNext
// @target: ESNext
import assert from "assert";
// ---cut---
import { deployFunction } from "@remotion/lambda";

const { alreadyExisted } = await deployFunction({
  createCloudWatchLogGroup: true,
  region: "us-east-1",
  timeoutInSeconds: 120,
  memorySizeInMb: 3009,
  enableLambdaInsights: true,
});

// Note: If the function previously already existed, Lambda insights are not applied.
// Delete the old function and deploy again.
assert(!alreadyExisted);
```

## View Lambda insights

In your CloudWatch dashboard ([link for `us-east-1`](https://eu-central-1.console.aws.amazon.com/cloudwatch/home)) under Insights ➞ Lambda Insights ➞ Single function, you can view the metrics of the Remotion Lambda function.

A link to the Lambda insights is also included in the return value of [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda).

If you render via the CLI with the `--log=verbose` flag, a link to the Lambda insights is also printed, regardless of if Lambda insights are enabled or not.

## See also

- [Debugging failed Lambda renders](/docs/lambda/troubleshooting/debug)
