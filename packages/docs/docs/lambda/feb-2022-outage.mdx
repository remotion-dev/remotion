---
image: /generated/articles-docs-lambda-feb-2022-outage.png
id: feb-2022-outage
sidebar_label: 02/2022 Outage
title: February 2022 Outage
---

:::tip
**Update 2022/02/06:**

The problem is now solved. Your Lambda functions should work as normal. We recommend everyone to go back to use ARM64 Lambdas. We will consult with AWS support on how to prevent issues like this in the future.
:::

On February 3rd 2022, AWS made a change to their Lambda micro-VMs that breaks Remotion Lambda. This document contains information for affected users.

## Hotfix solution

[Upgrade](/docs/lambda/upgrading) your Lambda functions to the latest version and deploy them with a `x86_64` architecture.

Via CLI:

```
npx remotion lambda functions deploy --architecture=x86_64
```

Via Node.JS:

## Example

```ts
import {deployFunction} from '@remotion/lambda';

const {functionName} = await deployFunction({
  region: 'us-east-1',
  timeoutInSeconds: 120,
  memorySizeInMb: 1024,
  createCloudWatchLogGroup: true,
  architecture: 'x86_64',
});
console.log(functionName);
```

## Caveat

The x86_64 version **does not contain fonts for Japanese/Chinese/Korean**! Since the binaries are bigger on the **x86_64** version, we exceeded the file limit and had to delete the biggest font in order to stay within the AWS bounds.

x86_64 is also slower and has about a 30% higher cost/performance ratio.

## AWS mitigation

We contacted AWS and hope to receive an answer soon.

## Long-term solution

ARM64 is the preferred and default solution. Once the problem is solved, we recommend everyone to switch back.

## Contact

Join the discussion in our Discord channel if you have questions.
