---
id: cli
sidebar_label: Overview
title: "@remotion/lambda - CLI"
slug: /lambda/cli
---

To use the Remotion Lambda CLI, you first need to [install it](/docs/lambda/setup).

## Commands

- [sites](/docs/lambda/cli/sites)
- [functions](/docs/lambda/cli/functions)
- [render](/docs/lambda/cli/render)
- [still](/docs/lambda/cli/still)
- [compositions](/docs/lambda/cli/compositions)
- [policies](/docs/lambda/cli/policies)
- [quotas](/docs/lambda/cli/quotas)

## Global options

### `--region`

Selects an AWS region: For example:

```
--region=eu-central-1
```

The default region is `us-east-1`. You may also set a `REMOTION_AWS_REGION` environment variable directly or via `.env` file.

See: [Region selection](/docs/lambda/region-selection)

### `--yes`, `-y`

Skips confirmation when doing a destructive action.

### `--quiet`, `-q`

Prints the minimal amount of logs.
