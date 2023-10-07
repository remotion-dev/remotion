---
image: /generated/articles-docs-cloudrun-cli.png
id: cli
sidebar_label: Overview
title: "@remotion/cloudrun - CLI"
slug: /cloudrun/cli
---

<ExperimentalBadge>
<p>Cloud Run is in <a href="/docs/cloudrun-alpha">Alpha</a>, which means APIs may change in any version and documentation is not yet finished. See the <a href="https://remotion.dev/changelog">changelog to stay up to date with breaking changes</a>.</p>
</ExperimentalBadge>

To use the Remotion Cloud Run CLI, you first need to [install it](/docs/cloudrun/setup).

## Commands

- [sites](/docs/cloudrun/cli/sites)
- [services](/docs/cloudrun/cli/services)
- [render](/docs/cloudrun/cli/render)
- [still](/docs/cloudrun/cli/still)
- [permissions](/docs/cloudrun/cli/permissions)
- [regions](/docs/cloudrun/cli/regions)

## Global options

### `--region`

Selects a GCP region: For example:

```
--region=us-central1
```

The default region is `us-east1`. You may also set a `REMOTION_GCP_REGION` environment variable directly or via `.env` file.

See: [Region selection](/docs/cloudrun/region-selection)

### `--yes`, `-y`

Skips confirmation when doing a destructive action.

### `--quiet`, `-q`

Prints the minimal amount of logs.
