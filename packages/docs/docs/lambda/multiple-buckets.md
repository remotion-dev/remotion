---
image: /generated/articles-docs-lambda-multiple-buckets.png
title: Multiple buckets in Remotion Lambda
slug: /lambda/multiple-buckets
sidebar_label: Multiple buckets
crumb: "@remotion/lambda"
---

The ideal setup is if you use **1 bucket per region and account** that you use Remotion Lambda in.

While it is discouraged, it is possible to use multiple buckets from version v3.3.42 on.

## Reasons for 1 bucket

It is not necessary to create multiple buckets because:

- An S3 bucket is an effectively infinitely scalable storage solution.
- Remotion will perfectly isolate each render so they do not interfere with another.
- You can give sites a unique identifier to separate production and development environments.
- The Remotion Lambda function is a binary that does not change with your codebase.

You might intuitively create multiple buckets because you have multiple environments, but it is usually not needed.

In addition to that, Remotion was not designed for multiple buckets. While you can explicitly specify a bucket name, it is optional and therefore easy to forget.

## Using multiple buckets

If you want to use multiple buckets nonetheless (applying different policies to them or fulfilling business or compliance requirements), you can create more buckets in the AWS console. Don't use [`getOrCreateBucket()`](/docs/lambda/getorcreatebucket) to create them.

Remotion will by default discover buckets automatically and re-use them. If it detects multiple buckets, it will throw an error.

In order to avoid this error, you need to additionally explicitly pass the `forceBucketName` option to the following APIs:

- [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda)
- [`getCompositionsOnLambda()`](/docs/lambda/getcompositionsonlambda)
- [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda)

Also you must pass a `--force-bucket-name=your-bucket-name` option to the following CLI commands:

- [`npx remotion lambda render`](/docs/lambda/cli/render)
- [`npx remotion lambda still`](/docs/lambda/cli/still)
- [`npx remotion lambda compositions`](/docs/lambda/cli/compositions)
- [`npx remotion lambda sites create`](/docs/lambda/cli/sites#create)
- [`npx remotion lambda sites rm`](/docs/lambda/cli/sites#rm)
- [`npx remotion lambda sites rmall`](/docs/lambda/cli/sites#rmall)

Also you are unable to use the following APIs:

- [`npx remotion lambda sites ls`](/docs/lambda/cli/sites#ls)
- [`getSites()`](/docs/lambda/getsites)
- [`getOrCreateBucket()`](/docs/lambda/getorcreatebucket)

## Deleting extraneous buckets

If you got an error message

```
You have multiple buckets [a,b,c] in your S3 region [us-east-1] starting with "remotionlambda-".
```

but you were not intending to use multiple buckets, delete the extraneous buckets in the AWS console to fix the error.

## See also

- [Bucket naming](/docs/lambda/bucket-naming)
