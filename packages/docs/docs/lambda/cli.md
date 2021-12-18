---
id: cli
sidebar_label: Overview
title: "@remotion/lambda - CLI"
slug: /lambda/cli
---

## Commands

- [sites](/docs/lambda/sites)
- [functions](/docs/lambda/functions)
- [render](/docs/lambda/render)
- [still](/docs/lambda/still)
- [policies](/docs/lambda/policies)

## Global options

### `--region`

Selects an AWS region: For example:

```
--region=eu-central-1
```

The default region is `us-east-1`. You may also set a `AWS_REGION` environment variable directly or via `.env` file.

### `--yes`, `-y`

Skips confirmation when doing a destructive action.

### `--quiet`, `-q`

Prints the minimal amount of logs.
