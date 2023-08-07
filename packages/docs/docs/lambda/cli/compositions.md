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

<details>
<summary>Show output
</summary>
<pre>
looped                          60      1080x1080      200 (3.33 sec)<br/>
cancel-render                   30      920x720        100 (3.33 sec)<br/>
iframe                          30      1080x1080      10 (0.33 sec)<br/>
stagger-test                    30      1280x720       100 (3.33 sec)<br/>
freeze-example                  30      1280x720       300 (10.00 sec)<br/>
base-spring                     30      1080x1080      100 (3.33 sec)<br/>
spring-with-duration            30      1080x1080      100 (3.33 sec)<br/>
missing-img                     30      1080x1080      10 (0.33 sec)<br/>
ten-frame-tester                30      1080x1080      10 (0.33 sec)<br/>
framer                          30      1080x1080      100 (3.33 sec)<br/>
skip-zero-frame                 30      1280x720       100 (3.33 sec)<br/>
scripts                         30      1280x720       100 (3.33 sec)<br/>
many-audio                      30      1280x720       30 (1.00 sec)<br/>
error-on-frame-10               30      1280x720       1000000 (33333.33 sec)<br/>
wrapped-in-context                      1280x720       Still<br/>
drop-dots                       30      1080x1080      5400 (180.00 sec)<br/>
</pre>
</details>

- The serve URL is obtained by deploying a project to Remotion using the [`sites create`](/docs/lambda/cli/sites#create) command or calling [`deploySite()`](/docs/lambda/deploysite).

Note that you can also get the compositions of a site that is hosted on Lambda using [`npx remotion compositions`](/docs/cli/compositions). Vice versa, you can also get the compositions from a serve URL that is not hosted on AWS Lambda using `npx remotion lambda compositions`.

You should use `npx remotion lambda compositions` if you cannot use [`npx remotion compositions`](/docs/cli/compositions) because the machine cannot run Chrome.

## Flags

### `--props`

[React Props that can be retrieved using `getInputProps()`.](/docs/get-input-props) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`).

:::info
Inline JSON string isn't supported on Windows because it removes the `"` character, use a temporary file instead.
:::

### `--config`

Specify a location for the Remotion config file.

### `--env-file`

Specify a location for a dotenv file - Default `.env`. [Read about how environment variables work in Remotion.](/docs/env-variables)

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

### `--force-bucket-name`<AvailableFrom v="3.3.42" />

Specify a specific bucket name to be used. [This is not recommended](/docs/lambda/multiple-buckets), instead let Remotion discover the right bucket automatically.

### `--user-agent`<AvailableFrom v="3.3.83"/>

Lets you set a custom user agent that the headless Chrome browser assumes.

## See also

- [`getCompositionsOnLambda()`](/docs/lambda/getcompositionsonlambda)
- [`npx remotion compositions`](/docs/cli/compositions)
