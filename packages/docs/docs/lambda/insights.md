---
sidebar_label: Insights
title: Enable Lambda Insights
crumb: "Lambda"
---

# Enable Lambda insights<AvailableFrom v="4.0.61"/>

You may enable [AWS Lambda Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights.html) for your Remotion Lambda function.

## Prerequisites

<Step>1</Step> Ensure you are on at least Remotion v4.0.61. <br/>
<Step>2</Step> If you started using Remotion before v4.0.61, update both your <a href="/docs/lambda/permissions#user-permissions">AWS user permission</a> and <a href="/docs/lambda/permissions#role-permissions">AWS role permission</a>, since now more permissions are needed.

## Enable Lambda insights

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
