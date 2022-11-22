---
sidebar_label: Light client
title: Light client
---

The following methods and types can be imported from `@remotion/lambda/client`:

```tsx twoslash
import {
  renderMediaOnLambda,
  renderStillOnLambda,
  getRenderProgress,
  getCompositionsOnLambda,
  getFunctions,
  AwsRegion,
  RenderProgress,
  validateWebhookSignature,
  WebhookPayload,
} from "@remotion/lambda/client";
```

These functions don't have any Node.JS dependencies and can be bundled with a bundler such as Webpack or ESBuild.

**We don't recommend calling these functions from the browser directly, as you will leak your AWS credentials.**

Instead, this light client is meant to reduce the bundle size and avoid problems if you are calling Remotion Lambda APIs from another Lambda function and therefore need to bundle your function code.

Commonly, Next.JS serverless endpoints or similar use AWS Lambda functions under the hood, for which `@remotion/lambda/client` can be used.