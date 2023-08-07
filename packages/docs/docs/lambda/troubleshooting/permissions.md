---
image: /generated/articles-docs-lambda-troubleshooting-permissions.png
id: permissions
sidebar_label: Permissions
title: AWS Permissions Troubleshooting
crumb: "Lambda Troubleshooting"
---

If you get an error message saying that something is wrong with your AWS permissions, read this page for troubleshooting ideas.

## Node.JS APIs don't read the `.env` file

If you use the Node.JS APIs, be aware that they don't read the .env file automatically. This means you need to either load the .env file or set the environment variables manually.

## User and role permissions have been mixed up

There are two policy files, one for an AWS user, one for an AWS role. The policies are different, make sure you have correctly assigned both.

## Not enough time has passed for settings to apply

It can take several minutes until the policies you entered into AWS propagate. Sometimes waiting 2-3 minutes can solve the problem.

## Required permissions have changed

A newer Remotion Lambda version might have required additional permissions. We will note this in the [changelog](https://github.com/remotion-dev/remotion/releases). Make sure you update the policies in AWS.

## Other AWS credentials might have been applied

If AWS environment variables failed to load, other credentials might have been loaded from other places such as the AWS CLI. Log the environment variables to ensure you loaded the correct ones.

## Use the validate command

Use the [`npx remotion lambda policies validate`](/docs/lambda/cli/policies) command to validate the user policy. Note that this can still mean the role policy is set wrongly or the environment variables don't get loaded when using the Node.JS APIs.

## See also

- [Lambda - Permissions](/docs/lambda/permissions)
