---
image: /generated/articles-docs-lambda-validatewebhooksignature.png
id: validatewebhooksignature
title: validateWebhookSignature()
slug: /lambda/validatewebhooksignature
crumb: "Lambda API"
---

_Available from v3.2.30_

Validates that the signature that was received by a [webhook](/docs/lambda/webhooks) endpoint is authentic. If the validation fails, an error is thrown.

## API

The function accepts an object with three key-value pairs:

### `secret`

The same webhook secret that was passed to [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda)'s webhook options.

### `body`

The body that was received by the endpoint - takes a parsed JSON object, not a `string`.

### `signatureHeader`

The `X-Remotion-Signature` header from the request that was received by the endpoint.

## Example

In the following Next.JS webhook endpoint, an error gets thrown if the signature does not match the one expected one or is missing..

```tsx twoslash title="pages/api/webhook.ts"
type NextApiRequest = {
  body: object;
  headers: Record<string, string>;
};
type NextApiResponse = {
  status: (code: number) => { json: (body: object) => void };
};
// ---cut---
import {
  validateWebhookSignature,
  WebhookPayload,
} from "@remotion/lambda/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  validateWebhookSignature({
    secret: process.env.WEBHOOK_SECRET as string,
    body: req.body,
    signatureHeader: req.headers["x-remotion-signature"] as string,
  });

  // If code reaches this path, the webhook is authentic.
  const payload = req.body as WebhookPayload;
  if (payload.type === "success") {
    // ...
  } else if (payload.type === "timeout") {
    // ...
  }

  res.status(200).json({
    success: true,
  });
}
```

See [Webhooks](/docs/lambda/webhooks) for an Express example.

## See also

- [Webhooks](/docs/lambda/webhooks)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/validate-webhook-signature.ts)
