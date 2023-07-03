---
image: /generated/articles-docs-lambda-cli-still.png
id: still
sidebar_label: still
title: "npx remotion lambda still"
slug: /lambda/cli/still
crumb: "Lambda CLI Reference"
---

Using the `npx remotion lambda still` command, you can render a still frame in the cloud.

The command has the following structure:

```
npx remotion lambda still <serve-url> [<composition-id>] [<output-location>]
```

- The serve URL is obtained by deploying a project to Remotion using the [`sites create`](/docs/lambda/cli/sites#create) command or calling [`deploySite()`](/docs/lambda/deploysite).
- The [composition ID](/docs/terminology#composition-id). If not specified, the list of compositions will be fetched and you can choose a composition.
- The `output-location` parameter is optional. If you don't specify it, the still is stored in your S3 bucket. If you specify a location, it gets downloaded to your device in an additional step.

## Example commands

Rendering a still:

```
npx remotion lambda still https://remotionlambda-abcdef.s3.eu-central-1.amazonaws.com/sites/testbed/index.html my-comp
```

Rendering using the serve URL shorthand:

```
npx remotion lambda still testbed my-comp
```

Rendering the 10th frame of a composition:

```
npx remotion lambda still --frame=10 testbed my-comp
```

Downloading the result to a `out.png` file:

```
npx remotion lambda still testbed my-comp out.png
```

## Flags

### `--frame`

Render a specific frame of a composition. Default `0`

### `--region`

The [AWS region](/docs/lambda/region-selection) to select. Both project and function should be in this region.

### `--props`

[React Props to pass to the root component of your video.](/docs/parametrized-rendering#passing-input-props-in-the-cli) Must be a serialized JSON string (`--props='{"hello": "world"}'`) or a path to a JSON file (`./path/to/props.json`).

### `--scale`

[Scales the output frames by the factor you pass in.](/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details.

### `--log`

Log level to be used inside the Lambda function. Also, if you set it to `verbose`, a link to CloudWatch will be printed where you can inspect logs.

### `--privacy`

Defines if the output media is accessible for everyone or not. Either `public` or `private`, default `public`.

### `--max-retries`

How many times a single chunk is being retried if it fails to render. Default `1`.

### `--out-name`

The file name of the media output as stored in the S3 bucket. By default, it is `out` plus the appropriate file extension, for example: `out.png`. Must match `/([0-9a-zA-Z-!_.*'()/]+)/g`.

### `--jpeg-quality`

[Value between 0 and 100 for JPEG rendering quality](/docs/config#setjpegquality). Doesn't work when rendering an image format other than JPEG.

### ~~`--quality`~~

Renamed to `jpegQuality` in `v4.0.0`.

### `--ignore-certificate-errors`

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored.

### `--disable-web-security`

This will most notably disable CORS in Chrome among other security features.

### `--user-agent`<AvailableFrom v="3.3.83"/>

Lets you set a custom user agent that the headless Chrome browser assumes.
