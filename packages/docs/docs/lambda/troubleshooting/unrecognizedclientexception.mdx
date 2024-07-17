---
image: /generated/articles-docs-lambda-troubleshooting-unrecognizedclientexception.png
id: unrecognizedclientexception
title: UnrecognizedClientException
crumb: "Lambda Troubleshooting"
---

If you got a permission error while calling [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) or [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda):

```txt
UnrecognizedClientException: The AWS credentials provided were probably mixed up.
```

it means that the AWS credentials were correct, but don't allow access to a certain resource.

## Most common cause: Calling a Remotion function inside a serverless function

When calling render inside an AWS Lambda function or a Vercel serverless function, that function already has it's own `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables set. However, these are from AWS itself and are different from the variables that Remotion uses to invoke serverless functions.

To avoid that conflict, you can change the name of the environment variables you set:

- Rename `AWS_ACCESS_KEY_ID` to `REMOTION_AWS_ACCESS_KEY_ID`
- Rename `AWS_SECRET_ACCESS_KEY` to `REMOTION_AWS_SECRET_ACCESS_KEY`

If both are set, Remotion will prefer the environment variables that are prefixed with `REMOTION_`, which should separate the two different credentials nicely.
