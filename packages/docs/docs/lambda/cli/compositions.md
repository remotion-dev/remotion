---
image: /generated/articles-docs-lambda-cli-compositions.png
title: npx remotion lambda compositions
sidebar_label: compositions
crumb: "Lambda CLI Reference"
---

_Available from v3.3.2._

Print list of composition IDs from a serve URL, fetched from inside a Lambda function.

```bash
npx remotion lambda compositions <serve-url>
```

- The serve URL is obtained by deploying a project to Remotion using the [`sites create`](/docs/lambda/cli/sites#create) command or calling [`deploySite()`](/docs/lambda/deploysite).

Note that you can also get the compositions of a site that is hosted on Lambda using [`npx remotion compositions`](/docs/cli/compositions). Vice versa, you can also get the compositions from a serve URL that is not hosted on AWS Lambda using `npx remotion lambda compositions`.

You should use `npx remotion lambda compositions` if you cannot use [`npx remotion compositions`](/docs/cli/compositions) because the machine cannot run Chrome.

## Example commands

Rendering a still:

```
npx remotion lambda compositions https://remotionlambda-abcdef.s3.eu-central-1.amazonaws.com/sites/testbed/index.html
```

## Flags

### `--props`

[React Props that can be retrieved using `getInputProps()`.](/docs/get-input-props) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`).

:::info
Inline JSON string isn't supported on Windows because it removes the `"` character, use a temporary file instead.
:::

### `--config`

Specify a location for the Remotion config file.

### `--env-file`

Specify a location for a dotenv file. Default `.env`.

### `--log`

[Set the log level](/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` (_default_), `verbose`

:::info
If you don't feel like passing command line flags every time, consider creating a `remotion.config.ts` [config file](/docs/config).
:::

### `--timeout`

Define how long it may take to resolve all [`delayRender()`](/docs/delay-render) calls before the composition fetching times out in milliseconds. Default: `30000`.

:::info
Not to be confused with the [`--timeout` flag when deploying a Lambda function](/docs/lambda/cli/functions#--timeout).
:::

### `--ignore-certificate-errors`

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored.

### `--disable-web-security`

This will most notably disable CORS in Chrome among other security features.

### `--disable-headless`

Opens an actual browser to observe the composition fetching.

### `--quiet`, `--q`

Only prints the composition IDs, separated by a space.

## See also

- [`getCompositionsOnLambda()`](/docs/lambda/getcompositionsonlambda)
- [`npx remotion compositions`](/docs/cli/compositions)
