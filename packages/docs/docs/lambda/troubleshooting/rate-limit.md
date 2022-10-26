---
id: rate-limit
sidebar_label: Rate Limit
title: AWS Rate Limit Troubleshooting
---

If you get an error message:

```
TooManyRequestsException: Rate Exceeded.
```

while calling a Lambda function, it means your concurrency limit or burst limit has been reached.

- **Concurrency limit**: The maximum amount of Lambda functions that can run concurrently per region per account.
- **Burst limit**: The maximum amount of Lambda functions which can spawn in a short amount of time.

## Default concurrency limits

By default, the concurrency limit is 1000 functions per region, however in some regions the burst limit is only 500, somewhat limiting the scale you can use.

## Exception: New accounts using AWS Lambda

According to AWS, "some accounts" which are new to AWS Lambda might get a very low concurrency limit such as 10 when they first start with AWS Lambda. In that case, increase the limit via the AWS console or the Remotion CLI (see below).

## See your limits

To see your limits, run

```
npx remotion lambda quotas
```

:::note
If you get a permission error, repeat the user policy step in the [Setup Guide](/docs/lambda/setup) and update your user policy file in the AWS console.
:::

## Request an increase

You can request a quota increase under [`https://console.aws.amazon.com/servicequotas/home`](https://console.aws.amazon.com/servicequotas/home) or using the [Remotion CLI](/docs/lambda/cli/quotas):

```
npx remotion lambda quotas increase
```

:::note
This only works for AWS Root accounts, not the children of an organization. You can still request an increase via the console.
:::

[See here](/docs/lambda/limits#if-aws-asks-you-for-the-reason) for a default answer if AWS asks why you requested the increase.

## Unhelpful?

Contact the Remotion team, preferrably via [Discord](https://remotion.dev/discord) and we will be happy to help you with your rate limit problem.
