---
image: /generated/articles-docs-lambda-expresswebhook.png
id: expresswebhook
title: expressWebhook()
slug: /lambda/expresswebhook
crumb: 'Lambda API'
---

Simplifies the process of setting up a [Lambda Webhook](/docs/lambda/webhooks) in your Express.js server. See [`pagesRouterWebhook()`](/docs/lambda/pagesrouterwebhook) and [`appRouterWebhook()`](/docs/lambda/approuterwebhook) for doing the same with Next.js apps.

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

Setting up a webhook endpoint in an Express.js server.

```jsx twoslash title="server.js"
import {expressWebhook} from '@remotion/lambda/client';

const handler = expressWebhook({
  secret: 'mysecret',
  testing: true,
  extraHeaders: {
    region: "south-asia"
  },
  onSuccess: () => console.log('Rendering Completed Successfully'),
  onError: () => console.log('Something went wrong while rendering'),
  onTimeout: () => console.log('Timeout occured while rendering'),
})

router.post("/webhook", jsonParser, handler);

router.options("/webhook", jsonParser, handler);
```

See [Webhooks](/docs/lambda/webhooks) for a detailed example.

## See also

- [Webhooks](/docs/lambda/webhooks)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/express-webhook.ts)
