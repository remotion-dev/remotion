---
id: lambda-cli
sidebar_label: CLI
title: "@remotion/lambda - CLI"
---

You can get a list of all commands using `npx remotion-lambda --help`.

## Commands

### upload

Uploads a Remotion project to an S3 bucket. You will get a URL which you can pass to the `render` command to render the video.

```console
npx remotion-lambda upload src/index.ts
```

### policies

Prints the recommended policies to be added to the AWS user and the AWS role.

```console
npx remotion-lambda policies
```

### cleanup

This command helps remove Remotion-related resources from your AWS account.

```
npx remotion-lambda cleanup
```

### render

Renders a video using Remotion Lambda. You need to pass two arguments:

- A URL, obtained from the `upload` command.
- The ID of the composition that you want to render.

```
npx remotion-lambda render https://remotionlambda-abcdefgh.s3.eu-central-1.amazonaws.com/sites/abcdefgh HelloWorld
```
