---
sidebar_label: Webhooks
title: Webhooks
slug: /lambda/webhooks
---

import { WebhookTest } from "../../components/lambda/webhook-test";

When rendering on AWS Lambda, Remotion can send webhooks to notify you when the process terminates. This page describes the webhook payloads and how to set up a webhook API endpoint.

Refer to the CLI documentation to [learn how to launch a rendering process with webhooks enabled](/docs/lambda/rendermediaonlambda#wenhook).

## Setup

You will need to set up an API endpoint with a POST request handler. Make sure that the endpoint is reachable and accepts requests from AWS.

:::info
If you run the webhook endpoint on your local machine (i.e. on `localhost`), you will need to set up a public reverse proxy using a tool like [ngrok](https://ngrok.com/).
:::info

## Response

Every webhook has the following headers:

```json
{
  "Content-Type": "application/json",
  "X-Remotion-Mode": "production" | "demo",
  "X-Remotion-Signature": "sha1=HASHED_SIGNATURE" | "NO_SECRET_PROVIDED",
  "X-Remotion-Status": "success" | "timeout" | "error",
}
```

You can use these headers to verify the authenticity of the request, to check the status of your rendering process and to check whether the webhook was called from production code deployed to AWS or a demo application such the tool below or your own test suite.

The request body has the following structure:

```json
{
    "result": "success" | "timeout" | "error",
    "renderId": "string",
    "bucketName": "string",
    "expectedBucketOwner": "string",
    "outputUrl": "string",
    "outputFile": "string",
    "timeToFinish": "number",
    "lambdaErrors": [],
    "errors": [{
      "message": "string",
      "name": "string",
      "stack": "string",
    }],
}
```

Note that only the `result`, `renderId`, `bucketName` and `expectedBucketOwner` will always be returned [just like they are returned by the CLI itself](/docs/lambda/rendermediaonlambda#return-value).

If the render process times out, the reponse body will not contain any other fields.

The `outputUrl`, `outputFile` and `timeToFinish` keys are only returned if the render was successful. Note that a successful render process may still have non-fatal `lambdaErrors`:

```json
{
  "s3Location": "string",
  "explanation": "string" | null,
  "type": "renderer" | "browser" | "stitcher",
  "message": "string",
  "name": "string",
  "stack": "string",
  "frame": "number"| null,
  "chunk": "number"| null,
  "isFatal": "boolean",
  "attempt": "number",
  "willRetry": "boolean",
  "totalAttempts": "number",
  "tmpDir": {
    "files": [{
      "filename": "string",
      "size": "number",
    }],
    "total": "number"
  } | null,
}
```

The `errors` array will contain the error message and stack trace of any _fatal_ error that occurs during the render process. The `errors` array will be empty if the status is not `error`.

## Validate Webhooks

Remotion will sign all webhook requests if you provide a webhook secret in the CLI arguments.

:::warning
If you don't provide a secret, the `X-Remotion-Signature` will be set to `NO_SECRET_PROVIDED`. It is not possible to verify the authenticity and data integrity of a webhook request that is sent with a `NO_SECRET_PROVIDED` signature. If you want to verify incoming webhooks, you must provide a webhook secret.
:::warn

Remotion uses [HMAC](https://en.wikipedia.org/wiki/HMAC) with the [SHA-512 algorithm](https://en.wikipedia.org/wiki/SHA-2) to cryptographically sign the webhook requests it sends. This allows you to verify the authenticity and data integrity of incoming webhook requests.

In order to verify a webhook request, you will need to create a hex digest of a SHA-512 HMAC signature using your provided webhook key and the request body. If it matches the `X-Remotion-Signature` header, the request was indeed sent by Remotion and its request body is complete.

If it does not match, either the data integrity is compromised and the request body is incomplete or the request was not sent by Remotion.

This is how Remotion calculates the signature:

```javascript
import * as Crypto from 'crypto';

function calculateSignature(payload: string, secret?: string) {
  if (!secret) {
    return 'NO_SECRET_PROVIDED';
  } 
  const hmac = Crypto.createHmac('sha512', secret);
  const signature = 'sha512=' + hmac.update(payload).digest('hex');
  return signature;
}
```

In your webhook endpoint, the `payload` parameter is the request body and the `secret` parameter is your webhook secret.

## Example webhook endpoint

You can use any web framework and language to set up your webhook endpoint. The following example is written in JavaScript using the Express framework, but you can replicate the validation logic using a cryptography/HMAC library for your language.

```javascript
import express from "express";
import bodyParser from "body-parser";
import * as Crypto from "crypto";

const router = express();

// You'll need to add a JSON parser middleware globally or
// for the webhook route in order to get access to the request
// body.
const jsonParser = bodyParser.json();

// Express API endpoint
router.post("/my-remotion-webhook-endpoint", jsonParser, (req, res) => {
  if (signature === "NO_SECRET_PROVIDED") {
    // webhook request is not signed
  }

  const hmac = Crypto.createHmac("sha512", WEBHOOK_SECRET);
  const signature = `sha512=${hmac
    .update(JSON.stringify(req.body))
    .digest("hex")}`;

  if (signature === req.header("X-Remotion-Signature")) {
    // Request was sent by Remotion
    const status = req.header("X-Remotion-Status"); // success, timeout, error
    const mode = req.header("X-Remotion-Mode"); // demo or production
    console.log(req.body); // parsed JSON response
    // ...
  } else {
    // Request was NOT sent by Remotion or has an incomplete request body
    // ...
  }
});
```

## Test your webhook endpoint

You can use this tool to verify that your webhook endpoint is working properly. The tool will send an appropriate demo payload and log the response to the screen. All requests sent by this tool will have the `"X-Remotion-Mode"` header set to `"demo"`.

:::info
This tool sends the demo webhook requests directly from your browser, which has the following implications:

- If your server uses CORS middleware, make sure your API endpoint is configured to accept requests from `remotion.dev`. This is necessary for this tool to work, but **not** for your production webhook endpoint.
- You can use a server listening on `localhost` and don't need to use a reverse proxy.
:::info

<WebhookTest />
