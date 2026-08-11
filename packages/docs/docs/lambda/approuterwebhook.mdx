---
image: /generated/articles-docs-lambda-approuterwebhook.png
id: approuterwebhook
title: appRouterWebhook()
slug: /lambda/approuterwebhook
crumb: 'Lambda API'
---

Simplifies the process of setting up a [Lambda Webhook](/docs/lambda/webhooks) in your Next.js app which is using App Router. Refer to [`pagesRouterWebhook()`](/docs/lambda/pagesrouterwebhook) for doing the same in apps using Pages Router.

## API

The function accepts an object with six key-value pairs:

### `secret`

Your webhook secret, must be a `string`

### `testing`

Whether or not to allow requests intending to test the endpoint, useful while using Webhook endpoint tester on [Webhooks Page](/docs/lambda/webhooks). Should be a `boolean`.

### `extraHeaders`

Add your own custom headers to the outgoing response. Provide key-value pairs where both the key and value are strings.

### `onSuccess()`

A function that is called with a [`WebhookSuccessPayload`](/docs/lambda/webhooks#response) object as an argument when the incoming request indicates a successful event.

### `onError()`

A function that is called with a [`WebhookErrorPayload`](/docs/lambda/webhooks#response) object as an argument when the incoming request indicates an error.

### `onTimeout()`

A function that is called with a [`WebhookTimeoutPayload`](/docs/lambda/webhooks#response) object as an argument when the incoming request indicates a timeout.

## Example

Setting up a webhook endpoint in a Next.js app which uses App Router. This will listen on the endpoint: `mydomain.com/api`

```tsx twoslash title="app/api/route.ts"
import {appRouterWebhook} from '@remotion/lambda/client';

export const POST = appRouterWebhook({
  secret: 'mysecret',
  testing: true,
  extraHeaders: {
    region: 'south-asia',
  },
  onSuccess: () => console.log('Rendering Completed Successfully'),
  onError: () => console.log('Something went wrong while rendering'),
  onTimeout: () => console.log('Timeout occured while rendering'),
});

export const OPTIONS = POST;
```

See [Webhooks](/docs/lambda/webhooks) for an Express example.

## See also

- [Webhooks](/docs/lambda/webhooks)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/app-router-webhook.ts)
